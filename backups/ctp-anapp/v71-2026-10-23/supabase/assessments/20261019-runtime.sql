-- Shared authorization path for chapter exams and the separate final exam.
-- The final is available after the twelve chapters. Existing certificate
-- eligibility is deliberately not changed by this release.
CREATE OR REPLACE FUNCTION public.lms_exam_access_status(p_exam_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO public AS $$
DECLARE
  u uuid := auth.uid();
  e public.exams%ROWTYPE;
  v_chapter_number integer;
  score numeric;
  attempts integer := 0;
  historical boolean;
  required integer;
  passed integer;
BEGIN
  IF u IS NULL THEN RAISE EXCEPTION 'Usuário não autenticado.'; END IF;
  IF NOT public.lms_has_full_course_access(u) THEN RAISE EXCEPTION 'Acesso integral ao curso obrigatório.'; END IF;
  SELECT * INTO e FROM public.exams WHERE id=p_exam_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Prova não encontrada.'; END IF;
  SELECT c.chapter_number INTO v_chapter_number FROM public.chapters c WHERE c.id=e.chapter_id;
  IF NOT e.is_final_certification AND (v_chapter_number IS NULL OR v_chapter_number NOT BETWEEN 1 AND 12) THEN
    RAISE EXCEPTION 'Este capítulo é isento de avaliação.';
  END IF;
  SELECT s.best_score,s.attempts_count INTO score,attempts
  FROM public.user_exam_scores s WHERE s.user_id=u AND s.exam_id=e.id;
  historical := public.lms_has_historical_assessment_approval(u,'exam',e.id);
  SELECT count(*),count(*) FILTER(WHERE
    s.best_score>=coalesce(x.passing_score,70)
    OR public.lms_has_historical_assessment_approval(u,'exam',x.id))
  INTO required,passed
  FROM public.exams x JOIN public.chapters c ON c.id=x.chapter_id
  LEFT JOIN public.user_exam_scores s ON s.exam_id=x.id AND s.user_id=u
  WHERE c.chapter_number BETWEEN 1 AND 12 AND NOT x.is_final_certification
    AND (e.is_final_certification OR c.chapter_number<v_chapter_number);
  RETURN jsonb_build_object(
    'can_take_exam',passed=required,
    'best_score',score,'attempts_count',coalesce(attempts,0),
    'passing_score',coalesce(e.passing_score,70),
    'historically_approved',historical,
    'is_approved',coalesce(score,0)>=coalesce(e.passing_score,70) OR historical,
    'approval_rule',CASE WHEN coalesce(score,0)>=coalesce(e.passing_score,70) THEN 'current_70'
                        WHEN historical THEN 'historical_60' ELSE 'pending' END,
    'required_exams',required,'passed_required_exams',passed);
END $$;

-- Legacy clients continue to receive canonical indices and active questions.
CREATE OR REPLACE FUNCTION public.lms_get_exam(p_exam_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public AS $$
DECLARE e public.exams%ROWTYPE; access jsonb; questions jsonb;
BEGIN
  access := public.lms_exam_access_status(p_exam_id);
  IF NOT (access->>'can_take_exam')::boolean THEN
    RAISE EXCEPTION 'Conclua as provas anteriores. Nota mínima atual: 70%%; aprovações históricas são preservadas.';
  END IF;
  SELECT * INTO e FROM public.exams WHERE id=p_exam_id;
  SELECT jsonb_agg(jsonb_build_object('id',q.id,'exam_id',q.exam_id,'question',q.question,
      'options',q.options,'order_index',q.order_index) ORDER BY random())
  INTO questions FROM public.exam_questions q WHERE q.exam_id=p_exam_id AND q.is_active;
  IF jsonb_array_length(coalesce(questions,'[]'::jsonb))<>10 THEN
    RAISE EXCEPTION 'Prova temporariamente indisponível: são necessárias dez questões ativas.';
  END IF;
  RETURN to_jsonb(e)||jsonb_build_object('questions',questions,'historical_policy_preserved',true);
END $$;

-- Randomization is owned here, not by a biased Array.sort in the browser.
-- Correct letters never repeat consecutively, and the answer key stays private.
-- option_indices maps each displayed alternative back to its canonical index.
CREATE OR REPLACE FUNCTION public.lms_get_exam_v2(p_exam_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public AS $$
DECLARE
  result jsonb; q public.exam_questions%ROWTYPE; questions jsonb := '[]';
  previous_position integer := -1; target_position integer;
  distractors integer[]; mapping integer[]; display_options jsonb;
  position integer; pointer integer;
BEGIN
  result := public.lms_get_exam(p_exam_id);
  FOR q IN SELECT * FROM public.exam_questions WHERE exam_id=p_exam_id AND is_active ORDER BY random()
  LOOP
    SELECT i INTO target_position FROM generate_series(0,4) i
      WHERE i<>previous_position ORDER BY random() LIMIT 1;
    SELECT array_agg(i ORDER BY random()) INTO distractors
      FROM generate_series(0,4) i WHERE i<>q.correct_answer;
    mapping := ARRAY[]::integer[]; display_options := '[]'; pointer := 1;
    FOR position IN 0..4 LOOP
      IF position=target_position THEN mapping:=array_append(mapping,q.correct_answer);
      ELSE mapping:=array_append(mapping,distractors[pointer]); pointer:=pointer+1; END IF;
      display_options:=display_options||jsonb_build_array(q.options->mapping[position+1]);
    END LOOP;
    questions:=questions||jsonb_build_array(jsonb_build_object(
      'id',q.id,'exam_id',q.exam_id,'question',q.question,'order_index',q.order_index,
      'options',display_options,'option_indices',to_jsonb(mapping)));
    previous_position:=target_position;
  END LOOP;
  RETURN result||jsonb_build_object('questions',questions,'randomization_version',2);
END $$;

-- Grade against the exact version submitted, including archived questions from
-- exams already open before a release. Never rewrite a previous attempt.
CREATE OR REPLACE FUNCTION public.lms_submit_exam(p_exam_id uuid,p_answers jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO public AS $$
DECLARE
  u uuid := auth.uid(); e public.exams%ROWTYPE; access jsonb;
  version text; versions integer; supplied integer; expected integer; valid integer;
  correct integer; score numeric; passed boolean; attempt uuid;
  best numeric; attempts integer; historical boolean;
BEGIN
  access:=public.lms_exam_access_status(p_exam_id);
  IF NOT (access->>'can_take_exam')::boolean THEN
    RAISE EXCEPTION 'Conclua as provas anteriores. Nota mínima atual: 70%%.';
  END IF;
  IF p_answers IS NULL OR jsonb_typeof(p_answers)<>'object' THEN RAISE EXCEPTION 'Respostas inválidas.'; END IF;
  SELECT * INTO e FROM public.exams WHERE id=p_exam_id;
  SELECT count(*) INTO supplied FROM jsonb_object_keys(p_answers);
  SELECT min(q.bank_version),count(DISTINCT q.bank_version),count(*) FILTER(
    WHERE jsonb_typeof(p_answers->q.id::text)='number'
      AND (p_answers->>q.id::text)~'^[0-4]$')
  INTO version,versions,valid FROM public.exam_questions q
  WHERE q.exam_id=p_exam_id AND p_answers?q.id::text;
  IF versions<>1 OR version IS NULL OR valid<>supplied THEN
    RAISE EXCEPTION 'Respostas inválidas ou versões de prova misturadas. Reabra a prova.';
  END IF;
  SELECT count(*) INTO expected FROM public.exam_questions
    WHERE exam_id=p_exam_id AND bank_version=version;
  IF supplied<>expected OR expected=0 THEN
    RAISE EXCEPTION 'Responda todas as questões antes de finalizar.';
  END IF;
  SELECT count(*) INTO correct FROM public.exam_questions q
  WHERE q.exam_id=p_exam_id AND q.bank_version=version
    AND (p_answers->>q.id::text)::integer=q.correct_answer;
  score:=round(correct::numeric/expected*100,2);
  passed:=score>=coalesce(e.passing_score,70);
  INSERT INTO public.exam_attempts(user_id,exam_id,started_at,completed_at,score,total_questions,
      correct_answers,is_passed,answers)
  VALUES(u,p_exam_id,now(),now(),score,expected,correct,passed,p_answers) RETURNING id INTO attempt;
  INSERT INTO public.user_exam_scores(user_id,exam_id,chapter_id,best_score,attempts_count,last_attempt_at,updated_at)
  VALUES(u,p_exam_id,e.chapter_id,score,1,now(),now())
  ON CONFLICT(user_id,exam_id) DO UPDATE SET
    best_score=greatest(public.user_exam_scores.best_score,excluded.best_score),
    attempts_count=public.user_exam_scores.attempts_count+1,last_attempt_at=now(),updated_at=now()
  RETURNING best_score,attempts_count INTO best,attempts;
  historical:=public.lms_has_historical_assessment_approval(u,'exam',p_exam_id);
  IF e.chapter_id IS NOT NULL AND (best>=coalesce(e.passing_score,70) OR historical) THEN
    UPDATE public.user_progress SET quiz_completed=true,last_accessed_at=now()
      WHERE user_id=u AND chapter_id=e.chapter_id;
  END IF;
  RETURN jsonb_build_object('attempt_id',attempt,'score',score,'correct_answers',correct,
    'total_questions',expected,'is_passed',passed,'best_score',best,'attempts_count',attempts,
    'passing_score',coalesce(e.passing_score,70),'historically_approved',historical,
    'is_approved',best>=coalesce(e.passing_score,70) OR historical,'bank_version',version);
END $$;

REVOKE ALL ON FUNCTION public.lms_get_exam_v2(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.lms_get_exam_v2(uuid) TO authenticated,service_role;
-- No client needs the answer-key table. All deliveries use the safe RPC.
REVOKE SELECT ON public.exam_questions FROM PUBLIC,anon,authenticated;
