BEGIN;

-- CTP ANAPP: uma única regra acadêmica para quizzes, provas, progressão,
-- boletim e elegibilidade do certificado.
UPDATE public.exams
SET passing_score = 70
WHERE passing_score IS DISTINCT FROM 70;

UPDATE public.quizzes
SET passing_score = 70
WHERE passing_score IS DISTINCT FROM 70;

-- Tentativas antigas entre 60% e 69,99% deixam de aparecer como aprovadas.
-- Certificados já emitidos não são revogados automaticamente.
UPDATE public.exam_attempts attempt
SET is_passed = COALESCE(attempt.score, 0) >= COALESCE(exam.passing_score, 70)
FROM public.exams exam
WHERE exam.id = attempt.exam_id
  AND attempt.is_passed IS DISTINCT FROM (
    COALESCE(attempt.score, 0) >= COALESCE(exam.passing_score, 70)
  );

-- Recalcula o marcador acadêmico de cada capítulo avaliado usando a nova
-- nota mínima. Mantém a semântica existente: aprovação no quiz ou na prova
-- satisfaz o marcador de avaliação do capítulo.
WITH assessment_status AS (
  SELECT
    progress.user_id,
    progress.chapter_id,
    (
      EXISTS (
        SELECT 1
        FROM public.exams exam
        JOIN public.user_exam_scores score
          ON score.exam_id = exam.id
         AND score.user_id = progress.user_id
        WHERE exam.chapter_id = progress.chapter_id
          AND score.best_score >= COALESCE(exam.passing_score, 70)
      )
      OR EXISTS (
        SELECT 1
        FROM public.quizzes quiz
        JOIN public.user_quiz_scores score
          ON score.quiz_id = quiz.id
         AND score.user_id = progress.user_id
        WHERE quiz.chapter_id = progress.chapter_id
          AND score.best_score >= COALESCE(quiz.passing_score, 70)
      )
    ) AS assessment_passed
  FROM public.user_progress progress
  JOIN public.chapters chapter ON chapter.id = progress.chapter_id
  WHERE chapter.chapter_number NOT IN (0, 13, 14)
)
UPDATE public.user_progress progress
SET quiz_completed = status.assessment_passed,
    completion_percentage = round(
      (
        COALESCE(progress.video_completed, false)::integer
        + COALESCE(progress.apostila_completed, false)::integer
        + COALESCE(progress.podcast_completed, false)::integer
        + COALESCE(progress.materials_completed, false)::integer
        + COALESCE(progress.slides_completed, false)::integer
        + status.assessment_passed::integer
      ) * 100.0 / 6
    ),
    completed_at = CASE
      WHEN COALESCE(progress.video_completed, false)
       AND COALESCE(progress.apostila_completed, false)
       AND COALESCE(progress.podcast_completed, false)
       AND COALESCE(progress.materials_completed, false)
       AND COALESCE(progress.slides_completed, false)
       AND status.assessment_passed
        THEN COALESCE(progress.completed_at, now())
      ELSE NULL
    END,
    last_accessed_at = COALESCE(progress.last_accessed_at, now())
FROM assessment_status status
WHERE progress.user_id = status.user_id
  AND progress.chapter_id = status.chapter_id;

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
  v_passing_score integer;
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

  IF NOT public.lms_has_full_course_access(v_user_id) THEN
    RAISE EXCEPTION 'Acesso integral ao curso obrigatório.';
  END IF;

  SELECT
    exam.id,
    exam.chapter_id,
    exam.title,
    exam.description,
    COALESCE(exam.passing_score, 70),
    exam.time_limit_minutes,
    exam.is_final_certification,
    exam.instructions,
    chapter.chapter_number
  INTO
    v_exam_id,
    v_chapter_id,
    v_title,
    v_description,
    v_passing_score,
    v_time_limit_minutes,
    v_is_final_certification,
    v_instructions,
    v_chapter_number
  FROM public.exams exam
  JOIN public.chapters chapter ON chapter.id = exam.chapter_id
  WHERE exam.id = p_exam_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prova não encontrada.';
  END IF;

  SELECT count(*)
  INTO v_prior_count
  FROM public.exams exam
  JOIN public.chapters chapter ON chapter.id = exam.chapter_id
  WHERE chapter.chapter_number < v_chapter_number
    AND chapter.chapter_number NOT IN (0, 13, 14);

  SELECT count(*)
  INTO v_prior_passed
  FROM public.exams exam
  JOIN public.chapters chapter ON chapter.id = exam.chapter_id
  JOIN public.user_exam_scores score
    ON score.exam_id = exam.id
   AND score.user_id = v_user_id
   AND score.best_score >= COALESCE(exam.passing_score, 70)
  WHERE chapter.chapter_number < v_chapter_number
    AND chapter.chapter_number NOT IN (0, 13, 14);

  IF v_prior_passed < v_prior_count THEN
    RAISE EXCEPTION
      'A prova anterior precisa ser concluída com nota mínima de 70%% antes desta prova.';
  END IF;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', question.id,
        'exam_id', question.exam_id,
        'question', question.question,
        'options', question.options,
        'order_index', question.order_index
      )
      ORDER BY random()
    ),
    '[]'::jsonb
  )
  INTO v_questions
  FROM public.exam_questions question
  WHERE question.exam_id = p_exam_id;

  RETURN jsonb_build_object(
    'id', v_exam_id,
    'chapter_id', v_chapter_id,
    'title', v_title,
    'description', v_description,
    'passing_score', v_passing_score,
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
  v_passing_score integer;
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

  IF NOT public.lms_has_full_course_access(v_user_id) THEN
    RAISE EXCEPTION 'Acesso integral ao curso obrigatório.';
  END IF;

  IF p_answers IS NULL OR jsonb_typeof(p_answers) <> 'object' THEN
    RAISE EXCEPTION 'Respostas inválidas.';
  END IF;

  SELECT
    exam.chapter_id,
    chapter.chapter_number,
    COALESCE(exam.passing_score, 70)
  INTO v_chapter_id, v_chapter_number, v_passing_score
  FROM public.exams exam
  JOIN public.chapters chapter ON chapter.id = exam.chapter_id
  WHERE exam.id = p_exam_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prova não encontrada.';
  END IF;

  SELECT count(*)
  INTO v_prior_count
  FROM public.exams exam
  JOIN public.chapters chapter ON chapter.id = exam.chapter_id
  WHERE chapter.chapter_number < v_chapter_number
    AND chapter.chapter_number NOT IN (0, 13, 14);

  SELECT count(*)
  INTO v_prior_passed
  FROM public.exams exam
  JOIN public.chapters chapter ON chapter.id = exam.chapter_id
  JOIN public.user_exam_scores score
    ON score.exam_id = exam.id
   AND score.user_id = v_user_id
   AND score.best_score >= COALESCE(exam.passing_score, 70)
  WHERE chapter.chapter_number < v_chapter_number
    AND chapter.chapter_number NOT IN (0, 13, 14);

  IF v_prior_passed < v_prior_count THEN
    RAISE EXCEPTION
      'A prova anterior precisa ser concluída com nota mínima de 70%% antes desta prova.';
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
  FROM public.exam_questions question
  WHERE question.exam_id = p_exam_id
    AND p_answers ? question.id::text
    AND (p_answers ->> question.id::text) ~ '^[0-9]+$';

  IF v_answered <> v_total THEN
    RAISE EXCEPTION 'Responda todas as questões antes de finalizar.';
  END IF;

  SELECT count(*)
  INTO v_correct
  FROM public.exam_questions question
  WHERE question.exam_id = p_exam_id
    AND (p_answers ->> question.id::text)::integer = question.correct_answer;

  v_score := round((v_correct::numeric / v_total::numeric) * 100, 2);
  v_passed := v_score >= v_passing_score;

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

  IF v_best_score >= v_passing_score THEN
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
    'passing_score', v_passing_score
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

  SELECT count(*)
  INTO v_total
  FROM public.exams exam
  JOIN public.chapters chapter ON chapter.id = exam.chapter_id
  WHERE chapter.chapter_number NOT IN (0, 13, 14);

  SELECT
    count(*) FILTER (
      WHERE score.best_score >= COALESCE(exam.passing_score, 70)
    ),
    COALESCE(avg(score.best_score), 0)
  INTO v_passed, v_average
  FROM public.exams exam
  JOIN public.chapters chapter ON chapter.id = exam.chapter_id
  LEFT JOIN public.user_exam_scores score
    ON score.exam_id = exam.id
   AND score.user_id = p_user_id
  WHERE chapter.chapter_number NOT IN (0, 13, 14);

  RETURN jsonb_build_object(
    'eligible',
      v_total > 0
      AND v_passed = v_total
      AND v_average >= 70,
    'reason', CASE
      WHEN v_total > 0 AND v_passed = v_total AND v_average >= 70
        THEN 'Todas as provas obrigatórias foram aprovadas com nota mínima de 70% (nota 7,0). Os capítulos 0, 13 e 14 são isentos de avaliação.'
      ELSE format(
        'Conclua todas as provas obrigatórias com nota mínima de 70%% (nota 7,0) (%s/%s). Os capítulos 0, 13 e 14 são isentos de avaliação.',
        v_passed,
        v_total
      )
    END,
    'total_exams', v_total,
    'passed_exams', v_passed,
    'final_exam_score', round(v_average, 2),
    'passing_score', 70,
    'exempt_chapters', jsonb_build_array(0, 13, 14)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.lms_grade_report(
  p_user_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_caller_id uuid := auth.uid();
  v_target_id uuid := COALESCE(p_user_id, auth.uid());
  v_is_service_role boolean := COALESCE(auth.role() = 'service_role', false);
  v_full_name text;
  v_first_name text;
  v_last_name text;
  v_cpf text;
  v_chapters jsonb;
  v_total_chapters integer := 0;
  v_completed_chapters integer := 0;
  v_average_score numeric := 0;
BEGIN
  IF v_target_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado.';
  END IF;

  IF NOT v_is_service_role
     AND (
       v_caller_id IS NULL
       OR (
         v_target_id <> v_caller_id
         AND NOT public.lms_is_admin_or_master(v_caller_id)
       )
     )
  THEN
    RAISE EXCEPTION 'Acesso não autorizado ao boletim.';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_target_id) THEN
    RAISE EXCEPTION 'Usuário não encontrado.';
  END IF;

  SELECT
    COALESCE(
      NULLIF(btrim(profile.full_name), ''),
      NULLIF(btrim(role.full_name), ''),
      NULLIF(btrim(concat_ws(' ', extended.first_name, extended.last_name)), ''),
      NULLIF(btrim(auth_user.raw_user_meta_data ->> 'full_name'), ''),
      NULLIF(btrim(auth_user.email), ''),
      'Aluno'
    ),
    COALESCE(
      NULLIF(btrim(extended.cpf), ''),
      NULLIF(btrim(auth_user.raw_user_meta_data ->> 'cpf'), ''),
      ''
    )
  INTO v_full_name, v_cpf
  FROM auth.users auth_user
  LEFT JOIN public.profiles profile ON profile.id = auth_user.id
  LEFT JOIN public.user_roles role ON role.user_id = auth_user.id
  LEFT JOIN public.user_extended_profile extended
    ON extended.user_id = auth_user.id
  WHERE auth_user.id = v_target_id
  LIMIT 1;

  v_first_name := split_part(
    regexp_replace(v_full_name, '\s+', ' ', 'g'),
    ' ',
    1
  );
  v_last_name := btrim(
    substring(
      regexp_replace(v_full_name, '\s+', ' ', 'g')
      FROM char_length(v_first_name) + 1
    )
  );

  WITH required_exams AS (
    SELECT
      exam.id,
      exam.chapter_id,
      COALESCE(exam.passing_score, 70) AS passing_score,
      chapter.chapter_number,
      chapter.title AS chapter_title
    FROM public.exams exam
    JOIN public.chapters chapter ON chapter.id = exam.chapter_id
    WHERE chapter.chapter_number NOT IN (0, 13, 14)
  ),
  report_rows AS (
    SELECT
      required.chapter_number,
      required.chapter_title,
      COALESCE(score.best_score, 0)::numeric AS best_score,
      COALESCE(score.attempts_count, 0)::integer AS attempts,
      required.passing_score
    FROM required_exams required
    LEFT JOIN public.user_exam_scores score
      ON score.exam_id = required.id
     AND score.user_id = v_target_id
  )
  SELECT
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'chapter_number', chapter_number,
          'chapter_title', chapter_title,
          'best_score', round(best_score, 2),
          'attempts', attempts,
          'passing_score', passing_score
        )
        ORDER BY chapter_number
      ),
      '[]'::jsonb
    ),
    count(*)::integer,
    count(*) FILTER (WHERE best_score >= passing_score)::integer,
    COALESCE(round(avg(best_score), 2), 0)
  INTO
    v_chapters,
    v_total_chapters,
    v_completed_chapters,
    v_average_score
  FROM report_rows;

  RETURN jsonb_build_object(
    'user', jsonb_build_object(
      'first_name', COALESCE(NULLIF(v_first_name, ''), 'Aluno'),
      'last_name', COALESCE(v_last_name, ''),
      'cpf', COALESCE(v_cpf, '')
    ),
    'chapters', v_chapters,
    'average_score', v_average_score,
    'total_chapters', v_total_chapters,
    'completed_chapters', v_completed_chapters,
    'is_certified',
      v_total_chapters > 0
      AND v_completed_chapters = v_total_chapters
      AND v_average_score >= 70,
    'passing_score', 70,
    'generated_at', now()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_grades(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id uuid := auth.uid();
  v_exams jsonb;
  v_quizzes jsonb;
BEGIN
  IF v_admin_id IS NULL OR NOT public.lms_is_admin_or_master(v_admin_id) THEN
    RAISE EXCEPTION 'Acesso administrativo obrigatório.';
  END IF;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'assessment_id', exam.id,
        'title', exam.title,
        'chapter_number', chapter.chapter_number,
        'best_score', score.best_score,
        'attempts_count', COALESCE(score.attempts_count, 0),
        'passing_score', COALESCE(exam.passing_score, 70)
      )
      ORDER BY chapter.chapter_number
    ),
    '[]'::jsonb
  )
  INTO v_exams
  FROM public.exams exam
  JOIN public.chapters chapter ON chapter.id = exam.chapter_id
  LEFT JOIN public.user_exam_scores score
    ON score.exam_id = exam.id
   AND score.user_id = target_user_id;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'assessment_id', quiz.id,
        'title', quiz.title,
        'chapter_number', chapter.chapter_number,
        'best_score', score.best_score,
        'attempts_count', COALESCE(score.attempts_count, 0),
        'passing_score', COALESCE(quiz.passing_score, 70)
      )
      ORDER BY chapter.chapter_number
    ),
    '[]'::jsonb
  )
  INTO v_quizzes
  FROM public.quizzes quiz
  JOIN public.chapters chapter ON chapter.id = quiz.chapter_id
  LEFT JOIN public.user_quiz_scores score
    ON score.quiz_id = quiz.id
   AND score.user_id = target_user_id;

  RETURN jsonb_build_object('exams', v_exams, 'quizzes', v_quizzes);
END;
$$;

REVOKE ALL ON FUNCTION public.lms_get_exam(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.lms_submit_exam(uuid, jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.lms_certificate_eligibility(uuid)
  FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.lms_grade_report(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_list_grades(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.lms_get_exam(uuid)
  TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.lms_submit_exam(uuid, jsonb)
  TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.lms_certificate_eligibility(uuid)
  TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.lms_grade_report(uuid)
  TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_list_grades(uuid)
  TO authenticated, service_role;

COMMENT ON FUNCTION public.lms_grade_report(uuid) IS
  'Retorna o boletim consolidado das provas obrigatórias com nota mínima de 70% (nota 7,0).';

COMMIT;
