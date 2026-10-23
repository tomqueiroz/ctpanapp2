-- Run inside a transaction. Every fixture and generated attempt is rolled back.
SAVEPOINT assessment_qa;
DO $qa$
DECLARE
  u uuid; exam public.exams%ROWTYPE; payload jsonb; v_question jsonb;
  canonical public.exam_questions%ROWTYPE; answer jsonb; result jsonb;
  previous_correct integer; correct_position integer; idx integer; rounds integer;
  i integer; orders text[] := ARRAY[]::text[]; order_key text;
  good boolean; lower_score jsonb; access jsonb; legacy_version text;
BEGIN
  SELECT a.id INTO u FROM auth.users a
  WHERE public.lms_is_admin_or_master(a.id) AND public.lms_has_full_course_access(a.id) LIMIT 1;
  IF u IS NULL THEN RAISE EXCEPTION 'QA: conta administrativa de teste indisponível.'; END IF;
  PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',u,'role','authenticated')::text,true);
  PERFORM set_config('request.jwt.claim.sub',u::text,true);
  PERFORM set_config('request.jwt.claim.role','authenticated',true);

  -- Fixtures are local to this savepoint; no real grades are retained.
  INSERT INTO public.user_exam_scores(user_id,exam_id,chapter_id,best_score,attempts_count)
  SELECT u,e.id,e.chapter_id,70,0 FROM public.exams e JOIN public.chapters c ON c.id=e.chapter_id
    WHERE c.chapter_number BETWEEN 1 AND 12
  ON CONFLICT(user_id,exam_id) DO UPDATE SET best_score=greatest(user_exam_scores.best_score,70);

  FOR exam IN SELECT * FROM public.exams LOOP
    access:=public.lms_exam_access_status(exam.id);
    IF NOT (access->>'can_take_exam')::boolean THEN RAISE EXCEPTION 'QA: liberação incorreta.'; END IF;
    orders:=ARRAY[]::text[];
    FOR rounds IN 1..50 LOOP
      payload:=public.lms_get_exam_v2(exam.id);
      IF jsonb_array_length(payload->'questions')<>10 THEN RAISE EXCEPTION 'QA: contagem incorreta.'; END IF;
      previous_correct:=-1;
      SELECT string_agg(x->>'id',',') INTO order_key FROM jsonb_array_elements(payload->'questions') x;
      orders:=array_append(orders,order_key);
      FOR v_question IN SELECT * FROM jsonb_array_elements(payload->'questions') LOOP
        IF v_question?'correct_answer' OR v_question?'explanation' THEN RAISE EXCEPTION 'QA: gabarito exposto.'; END IF;
        SELECT * INTO canonical FROM public.exam_questions WHERE id=(v_question->>'id')::uuid;
        IF NOT canonical.is_active THEN RAISE EXCEPTION 'QA: questão arquivada exposta.'; END IF;
        IF jsonb_array_length(v_question->'options')<>5 OR
           (SELECT count(DISTINCT v) FROM jsonb_array_elements(v_question->'option_indices') v)<>5 THEN
          RAISE EXCEPTION 'QA: alternativas inválidas.';
        END IF;
        correct_position:=-1;
        FOR i IN 0..4 LOOP
          idx:=(v_question->'option_indices'->>i)::integer;
          IF idx NOT BETWEEN 0 AND 4 OR v_question->'options'->i IS DISTINCT FROM canonical.options->idx THEN
            RAISE EXCEPTION 'QA: mapeamento de gabarito corrompido.';
          END IF;
          IF idx=canonical.correct_answer THEN correct_position:=i; END IF;
        END LOOP;
        IF correct_position<0 OR correct_position=previous_correct THEN
          RAISE EXCEPTION 'QA: posição correta repetida consecutivamente.';
        END IF;
        previous_correct:=correct_position;
      END LOOP;
    END LOOP;
    IF (SELECT count(DISTINCT k) FROM unnest(orders) k)<2 THEN RAISE EXCEPTION 'QA: questões não randomizadas.'; END IF;
    SELECT jsonb_object_agg(id::text,correct_answer) INTO answer FROM public.exam_questions
      WHERE exam_id=exam.id AND is_active;
    result:=public.lms_submit_exam(exam.id,answer);
    IF (result->>'score')::numeric<>100 OR NOT (result->>'is_passed')::boolean THEN
      RAISE EXCEPTION 'QA: erro de correção em prova com todas corretas.';
    END IF;
    SELECT jsonb_object_agg(id::text,CASE WHEN n<=7 THEN correct_answer ELSE (correct_answer+1)%5 END) INTO answer
      FROM (SELECT id,correct_answer,row_number() OVER(ORDER BY order_index) n FROM public.exam_questions
        WHERE exam_id=exam.id AND is_active) q;
    result:=public.lms_submit_exam(exam.id,answer);
    IF (result->>'score')::numeric<>70 OR NOT (result->>'is_passed')::boolean THEN
      RAISE EXCEPTION 'QA: sete acertos não aprovam.';
    END IF;
    SELECT jsonb_object_agg(id::text,CASE WHEN n<=6 THEN correct_answer ELSE (correct_answer+1)%5 END) INTO answer
      FROM (SELECT id,correct_answer,row_number() OVER(ORDER BY order_index) n FROM public.exam_questions
        WHERE exam_id=exam.id AND is_active) q;
    result:=public.lms_submit_exam(exam.id,answer);
    IF (result->>'score')::numeric<>60 OR (result->>'is_passed')::boolean OR (result->>'best_score')::numeric<>100 THEN
      RAISE EXCEPTION 'QA: limite de aprovação ou preservação da melhor nota incorretos.';
    END IF;
    good:=false;
    BEGIN
      PERFORM public.lms_submit_exam(exam.id,answer-(SELECT key FROM jsonb_object_keys(answer) key LIMIT 1));
    EXCEPTION WHEN OTHERS THEN good:=true; END;
    IF NOT good THEN RAISE EXCEPTION 'QA: aceitou prova incompleta.'; END IF;
    good:=false;
    BEGIN
      PERFORM public.lms_submit_exam(exam.id,answer||jsonb_build_object(
        (SELECT key FROM jsonb_object_keys(answer) key LIMIT 1),9));
    EXCEPTION WHEN OTHERS THEN good:=true; END;
    IF NOT good THEN RAISE EXCEPTION 'QA: aceitou índice fora do intervalo.'; END IF;
    good:=false;
    BEGIN
      PERFORM public.lms_submit_exam(exam.id,answer||jsonb_build_object(gen_random_uuid()::text,0));
    EXCEPTION WHEN OTHERS THEN good:=true; END;
    IF NOT good THEN RAISE EXCEPTION 'QA: aceitou chave desconhecida.'; END IF;

    -- An exam loaded before this release can still be graded against that bank.
    SELECT min(bank_version) INTO legacy_version FROM public.exam_questions WHERE exam_id=exam.id AND NOT is_active;
    IF legacy_version IS NOT NULL THEN
      SELECT jsonb_object_agg(id::text,correct_answer) INTO answer FROM public.exam_questions
        WHERE exam_id=exam.id AND bank_version=legacy_version;
      result:=public.lms_submit_exam(exam.id,answer);
      IF (result->>'score')::numeric<>100 THEN RAISE EXCEPTION 'QA: prova anterior corrompida.'; END IF;
    END IF;
  END LOOP;
  result:=public.lms_grade_report();
  IF jsonb_array_length(result->'chapters')<>12 OR (result->'final_exam'->>'best_score')::numeric<>100 THEN
    RAISE EXCEPTION 'QA: boletim não inclui corretamente capítulos e prova final.';
  END IF;
  -- Final stays locked when a required chapter is not approved.
  DELETE FROM public.user_exam_scores WHERE user_id=u;
  IF NOT EXISTS(SELECT 1 FROM public.exams e JOIN public.chapters c ON c.id=e.chapter_id
    WHERE c.chapter_number BETWEEN 1 AND 12 AND NOT public.lms_has_historical_assessment_approval(u,'exam',e.id)) THEN
    RAISE EXCEPTION 'QA: conta possui todas as aprovações históricas; use conta de QA sem histórico.';
  END IF;
  SELECT public.lms_exam_access_status(id) INTO access FROM public.exams WHERE is_final_certification AND chapter_id IS NULL;
  IF (access->>'can_take_exam')::boolean THEN RAISE EXCEPTION 'QA: prova final liberada sem pré-requisitos.'; END IF;
  PERFORM set_config('request.jwt.claims','{}',true);
  PERFORM set_config('request.jwt.claim.sub','',true);
  PERFORM set_config('request.jwt.claim.role','anon',true);
  good:=false;
  BEGIN PERFORM public.lms_get_exam_v2(exam.id); EXCEPTION WHEN OTHERS THEN good:=true; END;
  IF NOT good THEN RAISE EXCEPTION 'QA: leitura anônima permitida.'; END IF;
  good:=false;
  BEGIN PERFORM public.lms_submit_exam(exam.id,answer); EXCEPTION WHEN OTHERS THEN good:=true; END;
  IF NOT good THEN RAISE EXCEPTION 'QA: envio anônimo permitido.'; END IF;
END $qa$;
ROLLBACK TO SAVEPOINT assessment_qa;
