-- CTP ANAPP LMS: server-side exam grading, sequential exam release and
-- certificate eligibility at the required 60% threshold.

UPDATE public.exams
SET passing_score = 60,
    updated_at = now()
WHERE passing_score IS DISTINCT FROM 60;

-- Consolidate any historical duplicate score rows before enforcing one row per
-- user/exam. The retained row stores the highest score and cumulative attempts.
WITH ranked AS (
  SELECT
    id,
    user_id,
    exam_id,
    row_number() OVER (
      PARTITION BY user_id, exam_id
      ORDER BY best_score DESC NULLS LAST, updated_at DESC NULLS LAST, id
    ) AS rn,
    max(COALESCE(best_score, 0)) OVER (PARTITION BY user_id, exam_id) AS max_score,
    sum(COALESCE(attempts_count, 0)) OVER (PARTITION BY user_id, exam_id) AS total_attempts,
    max(last_attempt_at) OVER (PARTITION BY user_id, exam_id) AS latest_attempt
  FROM public.user_exam_scores
),
updated AS (
  UPDATE public.user_exam_scores s
  SET best_score = r.max_score,
      attempts_count = GREATEST(r.total_attempts, 1),
      last_attempt_at = r.latest_attempt,
      updated_at = now()
  FROM ranked r
  WHERE s.id = r.id
    AND r.rn = 1
  RETURNING s.id
)
DELETE FROM public.user_exam_scores s
USING ranked r
WHERE s.id = r.id
  AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS user_exam_scores_user_exam_uidx
  ON public.user_exam_scores (user_id, exam_id);

ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.exam_questions FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.lms_get_exam(p_exam_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_exam_id uuid;
  v_chapter_id integer;
  v_title text;
  v_description text;
  v_time_limit_minutes integer;
  v_is_final_certification boolean;
  v_instructions text;
  v_chapter_number integer;
  v_prior_count integer;
  v_prior_passed integer;
  v_questions jsonb;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado.';
  END IF;

  SELECT
    e.id,
    e.chapter_id,
    e.title,
    e.description,
    e.time_limit_minutes,
    e.is_final_certification,
    e.instructions,
    c.chapter_number
  INTO
    v_exam_id,
    v_chapter_id,
    v_title,
    v_description,
    v_time_limit_minutes,
    v_is_final_certification,
    v_instructions,
    v_chapter_number
  FROM public.exams e
  JOIN public.chapters c ON c.id = e.chapter_id
  WHERE e.id = p_exam_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prova não encontrada.';
  END IF;

  SELECT count(*)
  INTO v_prior_count
  FROM public.exams e
  JOIN public.chapters c ON c.id = e.chapter_id
  WHERE c.chapter_number < v_chapter_number;

  SELECT count(*)
  INTO v_prior_passed
  FROM public.exams e
  JOIN public.chapters c ON c.id = e.chapter_id
  JOIN public.user_exam_scores s
    ON s.exam_id = e.id
   AND s.user_id = v_user_id
   AND s.best_score >= 60
  WHERE c.chapter_number < v_chapter_number;

  IF v_prior_passed < v_prior_count THEN
    RAISE EXCEPTION
      'A prova anterior precisa ser concluída com nota mínima de 60%% antes desta prova.';
  END IF;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', q.id,
        'exam_id', q.exam_id,
        'question', q.question,
        'options', q.options,
        'order_index', q.order_index
      )
      ORDER BY random()
    ),
    '[]'::jsonb
  )
  INTO v_questions
  FROM public.exam_questions q
  WHERE q.exam_id = p_exam_id;

  RETURN jsonb_build_object(
    'id', v_exam_id,
    'chapter_id', v_chapter_id,
    'title', v_title,
    'description', v_description,
    'passing_score', 60,
    'time_limit_minutes', v_time_limit_minutes,
    'is_final_certification', v_is_final_certification,
    'instructions', v_instructions,
    'questions', v_questions
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.lms_submit_exam(
  p_exam_id uuid,
  p_answers jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_chapter_id integer;
  v_chapter_number integer;
  v_total integer;
  v_answered integer;
  v_correct integer;
  v_score numeric;
  v_passed boolean;
  v_attempt_id uuid;
  v_prior_count integer;
  v_prior_passed integer;
  v_best_score numeric;
  v_attempts_count integer;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado.';
  END IF;

  SELECT e.chapter_id, c.chapter_number
  INTO v_chapter_id, v_chapter_number
  FROM public.exams e
  JOIN public.chapters c ON c.id = e.chapter_id
  WHERE e.id = p_exam_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prova não encontrada.';
  END IF;

  SELECT count(*)
  INTO v_prior_count
  FROM public.exams e
  JOIN public.chapters c ON c.id = e.chapter_id
  WHERE c.chapter_number < v_chapter_number;

  SELECT count(*)
  INTO v_prior_passed
  FROM public.exams e
  JOIN public.chapters c ON c.id = e.chapter_id
  JOIN public.user_exam_scores s
    ON s.exam_id = e.id
   AND s.user_id = v_user_id
   AND s.best_score >= 60
  WHERE c.chapter_number < v_chapter_number;

  IF v_prior_passed < v_prior_count THEN
    RAISE EXCEPTION
      'A prova anterior precisa ser concluída com nota mínima de 60%% antes desta prova.';
  END IF;

  SELECT count(*)
  INTO v_total
  FROM public.exam_questions
  WHERE exam_id = p_exam_id;

  IF v_total = 0 THEN
    RAISE EXCEPTION 'Esta prova não possui questões cadastradas.';
  END IF;

  SELECT count(*)
  INTO v_answered
  FROM public.exam_questions q
  WHERE q.exam_id = p_exam_id
    AND p_answers ? q.id::text
    AND (p_answers ->> q.id::text) ~ '^[0-9]+$';

  IF v_answered <> v_total THEN
    RAISE EXCEPTION 'Responda todas as questões antes de finalizar.';
  END IF;

  SELECT count(*)
  INTO v_correct
  FROM public.exam_questions q
  WHERE q.exam_id = p_exam_id
    AND (p_answers ->> q.id::text)::integer = q.correct_answer;

  v_score := round((v_correct::numeric / v_total::numeric) * 100, 2);
  v_passed := v_score >= 60;

  INSERT INTO public.exam_attempts (
    user_id,
    exam_id,
    started_at,
    completed_at,
    score,
    total_questions,
    correct_answers,
    is_passed,
    answers
  )
  VALUES (
    v_user_id,
    p_exam_id,
    now(),
    now(),
    v_score,
    v_total,
    v_correct,
    v_passed,
    p_answers
  )
  RETURNING id INTO v_attempt_id;

  INSERT INTO public.user_exam_scores (
    user_id,
    exam_id,
    chapter_id,
    best_score,
    attempts_count,
    last_attempt_at,
    updated_at
  )
  VALUES (
    v_user_id,
    p_exam_id,
    v_chapter_id,
    v_score,
    1,
    now(),
    now()
  )
  ON CONFLICT (user_id, exam_id)
  DO UPDATE SET
    best_score = GREATEST(public.user_exam_scores.best_score, EXCLUDED.best_score),
    attempts_count = public.user_exam_scores.attempts_count + 1,
    last_attempt_at = now(),
    updated_at = now()
  RETURNING best_score, attempts_count
  INTO v_best_score, v_attempts_count;

  IF v_passed THEN
    UPDATE public.user_progress
    SET quiz_completed = true,
        last_accessed_at = now()
    WHERE user_id = v_user_id
      AND chapter_id = v_chapter_id;
  END IF;

  RETURN jsonb_build_object(
    'attempt_id', v_attempt_id,
    'score', v_score,
    'correct_answers', v_correct,
    'total_questions', v_total,
    'is_passed', v_passed,
    'best_score', v_best_score,
    'attempts_count', v_attempts_count,
    'passing_score', 60
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.lms_certificate_eligibility(
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller uuid := auth.uid();
  v_total integer;
  v_passed integer;
  v_average numeric;
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado.';
  END IF;

  IF p_user_id IS DISTINCT FROM v_caller
     AND NOT public.lms_is_admin_or_master(v_caller) THEN
    RAISE EXCEPTION 'Acesso administrativo obrigatório.';
  END IF;

  SELECT count(*) INTO v_total FROM public.exams;

  SELECT
    count(*) FILTER (WHERE s.best_score >= 60),
    COALESCE(avg(s.best_score), 0)
  INTO v_passed, v_average
  FROM public.exams e
  LEFT JOIN public.user_exam_scores s
    ON s.exam_id = e.id
   AND s.user_id = p_user_id;

  RETURN jsonb_build_object(
    'eligible', v_total > 0 AND v_passed = v_total,
    'reason', CASE
      WHEN v_total > 0 AND v_passed = v_total
        THEN 'Todas as provas obrigatórias foram aprovadas com nota mínima de 60%.'
      ELSE format(
        'Conclua todas as provas obrigatórias com nota mínima de 60%% (%s/%s).',
        v_passed,
        v_total
      )
    END,
    'total_exams', v_total,
    'passed_exams', v_passed,
    'final_exam_score', round(v_average, 2),
    'passing_score', 60
  );
END;
$$;

REVOKE ALL ON FUNCTION public.lms_get_exam(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.lms_submit_exam(uuid, jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.lms_certificate_eligibility(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.lms_get_exam(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.lms_submit_exam(uuid, jsonb) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.lms_certificate_eligibility(uuid) TO authenticated, service_role;
