-- CTP ANAPP LMS final QA hardening:
-- - enforce paid/free access inside exam and quiz RPCs;
-- - move quiz grading fully to the database;
-- - prevent students from writing attempts/scores directly;
-- - secure administrative RPCs and audit grade/access/certificate changes;
-- - guarantee at most one valid certificate per user.

BEGIN;

-- ---------------------------------------------------------------------------
-- Exam authorization and write hardening
-- ---------------------------------------------------------------------------

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

  IF NOT public.lms_has_full_course_access(v_user_id) THEN
    RAISE EXCEPTION 'Acesso integral ao curso obrigatório.';
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

  IF NOT public.lms_has_full_course_access(v_user_id) THEN
    RAISE EXCEPTION 'Acesso integral ao curso obrigatório.';
  END IF;

  IF p_answers IS NULL OR jsonb_typeof(p_answers) <> 'object' THEN
    RAISE EXCEPTION 'Respostas inválidas.';
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

-- ---------------------------------------------------------------------------
-- Server-side quiz delivery, grading and result review
-- ---------------------------------------------------------------------------

WITH ranked AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY user_id, quiz_id
      ORDER BY best_score DESC NULLS LAST, updated_at DESC NULLS LAST, id
    ) AS rn,
    max(COALESCE(best_score, 0)) OVER (PARTITION BY user_id, quiz_id) AS max_score,
    sum(COALESCE(attempts_count, 0)) OVER (PARTITION BY user_id, quiz_id) AS total_attempts,
    max(last_attempt_at) OVER (PARTITION BY user_id, quiz_id) AS latest_attempt
  FROM public.user_quiz_scores
),
updated AS (
  UPDATE public.user_quiz_scores s
  SET best_score = r.max_score,
      attempts_count = GREATEST(r.total_attempts, 1),
      last_attempt_at = r.latest_attempt,
      updated_at = now()
  FROM ranked r
  WHERE s.id = r.id
    AND r.rn = 1
  RETURNING s.id
)
DELETE FROM public.user_quiz_scores s
USING ranked r
WHERE s.id = r.id
  AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS user_quiz_scores_user_quiz_uidx
  ON public.user_quiz_scores (user_id, quiz_id);

CREATE OR REPLACE FUNCTION public.lms_get_quiz(p_quiz_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_quiz record;
  v_questions jsonb;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado.';
  END IF;

  IF NOT public.lms_has_full_course_access(v_user_id) THEN
    RAISE EXCEPTION 'Acesso integral ao curso obrigatório.';
  END IF;

  SELECT q.*
  INTO v_quiz
  FROM public.quizzes q
  WHERE q.id = p_quiz_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quiz não encontrado.';
  END IF;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', question.id,
        'quiz_id', question.quiz_id,
        'question', question.question,
        'option_a', question.option_a,
        'option_b', question.option_b,
        'option_c', question.option_c,
        'option_d', question.option_d,
        'order_index', question.order_index
      )
      ORDER BY random()
    ),
    '[]'::jsonb
  )
  INTO v_questions
  FROM public.quiz_questions question
  WHERE question.quiz_id = p_quiz_id;

  RETURN jsonb_build_object(
    'id', v_quiz.id,
    'chapter_id', v_quiz.chapter_id,
    'title', v_quiz.title,
    'description', v_quiz.description,
    'passing_score', v_quiz.passing_score,
    'time_limit_minutes', v_quiz.time_limit_minutes,
    'questions', v_questions
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.lms_submit_quiz(
  p_quiz_id uuid,
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
  v_passing_score integer;
  v_total integer;
  v_answered integer;
  v_correct integer;
  v_score numeric;
  v_passed boolean;
  v_attempt_id uuid;
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

  SELECT chapter_id, passing_score
  INTO v_chapter_id, v_passing_score
  FROM public.quizzes
  WHERE id = p_quiz_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quiz não encontrado.';
  END IF;

  SELECT count(*)
  INTO v_total
  FROM public.quiz_questions
  WHERE quiz_id = p_quiz_id;

  IF v_total = 0 THEN
    RAISE EXCEPTION 'Este quiz não possui questões cadastradas.';
  END IF;

  SELECT count(*)
  INTO v_answered
  FROM public.quiz_questions question
  WHERE question.quiz_id = p_quiz_id
    AND p_answers ? question.id::text
    AND upper(trim(p_answers ->> question.id::text)) ~ '^[A-D]$';

  IF v_answered <> v_total THEN
    RAISE EXCEPTION 'Responda todas as questões antes de finalizar.';
  END IF;

  SELECT count(*)
  INTO v_correct
  FROM public.quiz_questions question
  WHERE question.quiz_id = p_quiz_id
    AND upper(trim(p_answers ->> question.id::text))
      = upper(trim(question.correct_option::text));

  v_score := round((v_correct::numeric / v_total::numeric) * 100, 2);
  v_passed := v_score >= v_passing_score;

  INSERT INTO public.quiz_attempts (
    user_id,
    quiz_id,
    started_at,
    completed_at,
    score,
    total_questions,
    correct_answers,
    answers
  )
  VALUES (
    v_user_id,
    p_quiz_id,
    now(),
    now(),
    v_score,
    v_total,
    v_correct,
    p_answers
  )
  RETURNING id INTO v_attempt_id;

  INSERT INTO public.user_quiz_scores (
    user_id,
    quiz_id,
    best_score,
    attempts_count,
    last_attempt_at,
    updated_at
  )
  VALUES (
    v_user_id,
    p_quiz_id,
    v_score,
    1,
    now(),
    now()
  )
  ON CONFLICT (user_id, quiz_id)
  DO UPDATE SET
    best_score = GREATEST(public.user_quiz_scores.best_score, EXCLUDED.best_score),
    attempts_count = public.user_quiz_scores.attempts_count + 1,
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
    'passing_score', v_passing_score
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.lms_get_quiz_result(p_attempt_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_attempt record;
  v_quiz record;
  v_questions jsonb;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado.';
  END IF;

  SELECT *
  INTO v_attempt
  FROM public.quiz_attempts
  WHERE id = p_attempt_id
    AND (
      user_id = v_user_id
      OR public.lms_is_admin_or_master(v_user_id)
    );

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Resultado não encontrado.';
  END IF;

  IF NOT public.lms_has_full_course_access(v_attempt.user_id)
     AND NOT public.lms_is_admin_or_master(v_user_id) THEN
    RAISE EXCEPTION 'Acesso integral ao curso obrigatório.';
  END IF;

  SELECT *
  INTO v_quiz
  FROM public.quizzes
  WHERE id = v_attempt.quiz_id;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', question.id,
        'question', question.question,
        'option_a', question.option_a,
        'option_b', question.option_b,
        'option_c', question.option_c,
        'option_d', question.option_d,
        'correct_option', upper(trim(question.correct_option::text)),
        'explanation', question.explanation,
        'order_index', question.order_index
      )
      ORDER BY question.order_index, question.id
    ),
    '[]'::jsonb
  )
  INTO v_questions
  FROM public.quiz_questions question
  WHERE question.quiz_id = v_attempt.quiz_id;

  RETURN jsonb_build_object(
    'attempt', to_jsonb(v_attempt),
    'quiz', jsonb_build_object(
      'id', v_quiz.id,
      'title', v_quiz.title,
      'description', v_quiz.description,
      'passing_score', v_quiz.passing_score
    ),
    'questions', v_questions
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- Remove student-controlled score writes and keep only own/admin reads
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  v_table text;
  p record;
BEGIN
  FOREACH v_table IN ARRAY ARRAY[
    'exam_attempts',
    'user_exam_scores',
    'quiz_attempts',
    'user_quiz_scores'
  ]
  LOOP
    FOR p IN
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = v_table
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p.policyname, v_table);
    END LOOP;

    EXECUTE format(
      'REVOKE INSERT, UPDATE, DELETE ON public.%I FROM anon, authenticated',
      v_table
    );
    EXECUTE format(
      'GRANT SELECT ON public.%I TO authenticated',
      v_table
    );
    EXECUTE format(
      'GRANT ALL ON public.%I TO service_role',
      v_table
    );
  END LOOP;
END $$;

CREATE POLICY exam_attempts_select_own_or_admin
  ON public.exam_attempts
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.lms_is_admin_or_master(auth.uid())
  );

CREATE POLICY exam_attempts_service_role_all
  ON public.exam_attempts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY user_exam_scores_select_own_or_admin
  ON public.user_exam_scores
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.lms_is_admin_or_master(auth.uid())
  );

CREATE POLICY user_exam_scores_service_role_all
  ON public.user_exam_scores
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY quiz_attempts_select_own_or_admin
  ON public.quiz_attempts
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.lms_is_admin_or_master(auth.uid())
  );

CREATE POLICY quiz_attempts_service_role_all
  ON public.quiz_attempts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY user_quiz_scores_select_own_or_admin
  ON public.user_quiz_scores
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.lms_is_admin_or_master(auth.uid())
  );

CREATE POLICY user_quiz_scores_service_role_all
  ON public.user_quiz_scores
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DO $$
DECLARE
  p record;
BEGIN
  FOR p IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'quiz_questions'
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON public.quiz_questions',
      p.policyname
    );
  END LOOP;
END $$;

REVOKE SELECT, INSERT, UPDATE, DELETE
  ON public.quiz_questions
  FROM anon, authenticated;
GRANT ALL ON public.quiz_questions TO service_role;

CREATE POLICY quiz_questions_service_role_all
  ON public.quiz_questions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

REVOKE ALL ON FUNCTION public.lms_get_exam(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.lms_submit_exam(uuid, jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.lms_get_quiz(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.lms_submit_quiz(uuid, jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.lms_get_quiz_result(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.lms_get_exam(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.lms_submit_exam(uuid, jsonb) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.lms_get_quiz(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.lms_submit_quiz(uuid, jsonb) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.lms_get_quiz_result(uuid) TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Certificate integrity and secure administrative operations
-- ---------------------------------------------------------------------------

CREATE UNIQUE INDEX IF NOT EXISTS certificates_one_valid_per_user_uidx
  ON public.certificates (user_id)
  WHERE is_valid = true;

CREATE OR REPLACE FUNCTION public.admin_grant_payment(
  target_user_id uuid,
  payment_amount numeric DEFAULT 0,
  payment_method text DEFAULT 'manual',
  payment_notes text DEFAULT 'Acesso liberado manualmente pelo admin'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_admin_id uuid := auth.uid();
  v_payment_id uuid;
BEGIN
  IF v_admin_id IS NULL OR NOT public.lms_is_admin_or_master(v_admin_id) THEN
    RAISE EXCEPTION 'Acesso administrativo obrigatório.';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
    RAISE EXCEPTION 'Usuário não encontrado.';
  END IF;

  INSERT INTO public.payments (
    user_id,
    amount,
    currency,
    status,
    payment_method,
    transaction_id,
    gateway,
    metadata,
    paid_at,
    notes,
    granted_by,
    created_at,
    updated_at
  )
  VALUES (
    target_user_id,
    GREATEST(COALESCE(payment_amount, 0), 0),
    'BRL',
    'approved',
    COALESCE(NULLIF(trim(payment_method), ''), 'manual'),
    'ADMIN-' || gen_random_uuid()::text,
    'admin',
    jsonb_build_object('source', 'admin_grant_payment'),
    now(),
    payment_notes,
    v_admin_id,
    now(),
    now()
  )
  RETURNING id INTO v_payment_id;

  UPDATE public.profiles
  SET has_paid = true,
      notes = concat_ws(
        E'\n',
        NULLIF(notes, ''),
        '[' || now()::text || '] ' || payment_notes
      ),
      updated_at = now()
  WHERE id = target_user_id;

  PERFORM public.lms_activate_paid_access(target_user_id, v_payment_id);

  INSERT INTO public.lms_admin_audit_log (
    actor_user_id,
    target_user_id,
    action,
    details
  )
  VALUES (
    v_admin_id,
    target_user_id,
    'admin_grant_payment',
    jsonb_build_object(
      'payment_id', v_payment_id,
      'amount', GREATEST(COALESCE(payment_amount, 0), 0),
      'method', COALESCE(NULLIF(trim(payment_method), ''), 'manual'),
      'notes', payment_notes
    )
  );

  RETURN json_build_object(
    'success', true,
    'payment_id', v_payment_id,
    'message', 'Acesso concedido com sucesso'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_revoke_payment(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_admin_id uuid := auth.uid();
  v_is_alumni boolean;
  v_has_approved_payment boolean;
BEGIN
  IF v_admin_id IS NULL OR NOT public.lms_is_admin_or_master(v_admin_id) THEN
    RAISE EXCEPTION 'Acesso administrativo obrigatório.';
  END IF;

  SELECT COALESCE(is_alumni, false)
  INTO v_is_alumni
  FROM public.profiles
  WHERE id = target_user_id;

  IF v_is_alumni THEN
    RAISE EXCEPTION 'Acesso permanente de ex-aluno não pode ser revogado como pagamento.';
  END IF;

  UPDATE public.payments
  SET status = 'refunded',
      refunded_at = COALESCE(refunded_at, now()),
      updated_at = now(),
      notes = concat_ws(
        E'\n',
        NULLIF(notes, ''),
        '[' || now()::text || '] Acesso administrativo revogado por ' || v_admin_id::text
      )
  WHERE user_id = target_user_id
    AND status = 'approved'
    AND (
      gateway = 'admin'
      OR payment_method IN ('manual', 'admin_free_access')
    );

  SELECT EXISTS (
    SELECT 1
    FROM public.payments
    WHERE user_id = target_user_id
      AND status = 'approved'
  )
  INTO v_has_approved_payment;

  UPDATE public.profiles
  SET has_paid = v_has_approved_payment,
      updated_at = now()
  WHERE id = target_user_id;

  UPDATE public.student_enrollments
  SET status = CASE
        WHEN v_has_approved_payment THEN 'active'
        WHEN public.lms_user_email_confirmed(target_user_id) THEN 'chapter_zero'
        ELSE 'email_pending'
      END,
      payment_id = CASE WHEN v_has_approved_payment THEN payment_id ELSE NULL END,
      updated_at = now()
  WHERE user_id = target_user_id;

  INSERT INTO public.lms_admin_audit_log (
    actor_user_id,
    target_user_id,
    action,
    details
  )
  VALUES (
    v_admin_id,
    target_user_id,
    'admin_revoke_payment',
    jsonb_build_object('remaining_approved_payment', v_has_approved_payment)
  );

  RETURN json_build_object(
    'success', true,
    'has_approved_payment', v_has_approved_payment
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_issue_certificate(
  target_user_id uuid,
  cert_number text,
  cert_full_name text,
  cert_cpf text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_admin_id uuid := auth.uid();
  v_cert_number text;
  v_cert_id uuid;
  v_full_name text;
  v_cpf text;
  v_verify_code text;
  v_final_score numeric;
  v_existing record;
BEGIN
  IF v_admin_id IS NULL OR NOT public.lms_is_admin_or_master(v_admin_id) THEN
    RAISE EXCEPTION 'Acesso administrativo obrigatório.';
  END IF;

  SELECT *
  INTO v_existing
  FROM public.certificates
  WHERE user_id = target_user_id
    AND is_valid = true
  LIMIT 1;

  IF FOUND THEN
    RETURN json_build_object(
      'success', true,
      'certificate_id', v_existing.id,
      'certificate_number', v_existing.certificate_number,
      'verification_code', v_existing.verification_code,
      'message', 'O usuário já possui certificado válido'
    );
  END IF;

  SELECT COALESCE(
    NULLIF(trim(cert_full_name), ''),
    NULLIF(trim(p.full_name), ''),
    NULLIF(trim(concat_ws(' ', ep.first_name, ep.last_name)), '')
  ),
  COALESCE(
    NULLIF(regexp_replace(COALESCE(cert_cpf, ''), '\D', '', 'g'), ''),
    NULLIF(regexp_replace(COALESCE(ep.cpf, ''), '\D', '', 'g'), '')
  )
  INTO v_full_name, v_cpf
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  LEFT JOIN public.user_extended_profile ep ON ep.user_id = u.id
  WHERE u.id = target_user_id;

  IF v_full_name IS NULL OR v_cpf IS NULL OR length(v_cpf) <> 11 THEN
    RAISE EXCEPTION 'Nome completo e CPF válido são obrigatórios para emitir o certificado.';
  END IF;

  v_cert_number := COALESCE(
    NULLIF(trim(cert_number), ''),
    'CTP-' || to_char(now(), 'YYYY') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
  );
  v_verify_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 16));

  SELECT round(COALESCE(avg(best_score), 0), 2)
  INTO v_final_score
  FROM public.user_exam_scores
  WHERE user_id = target_user_id;

  INSERT INTO public.certificates (
    user_id,
    certificate_number,
    full_name,
    cpf,
    course_name,
    completion_date,
    total_hours,
    final_score,
    final_exam_score,
    verification_code,
    issued_at,
    is_valid,
    created_at
  )
  VALUES (
    target_user_id,
    v_cert_number,
    upper(v_full_name),
    v_cpf,
    'Curso Técnico de Piscinas - CTP ANAPP',
    current_date,
    160,
    v_final_score,
    v_final_score,
    v_verify_code,
    now(),
    true,
    now()
  )
  RETURNING id INTO v_cert_id;

  INSERT INTO public.lms_admin_audit_log (
    actor_user_id,
    target_user_id,
    action,
    details
  )
  VALUES (
    v_admin_id,
    target_user_id,
    'admin_issue_certificate',
    jsonb_build_object(
      'certificate_id', v_cert_id,
      'certificate_number', v_cert_number,
      'manual', true
    )
  );

  RETURN json_build_object(
    'success', true,
    'certificate_id', v_cert_id,
    'certificate_number', v_cert_number,
    'verification_code', v_verify_code,
    'message', 'Certificado emitido com sucesso'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_issue_certificate(
  target_user_id uuid,
  cert_number text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.admin_issue_certificate(
    target_user_id,
    cert_number,
    NULL::text,
    NULL::text
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_revoke_certificate(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id uuid := auth.uid();
  v_updated integer;
BEGIN
  IF v_admin_id IS NULL OR NOT public.lms_is_admin_or_master(v_admin_id) THEN
    RAISE EXCEPTION 'Acesso administrativo obrigatório.';
  END IF;

  UPDATE public.certificates
  SET is_valid = false
  WHERE user_id = target_user_id
    AND is_valid = true;
  GET DIAGNOSTICS v_updated = ROW_COUNT;

  INSERT INTO public.lms_admin_audit_log (
    actor_user_id,
    target_user_id,
    action,
    details
  )
  VALUES (
    v_admin_id,
    target_user_id,
    'admin_revoke_certificate',
    jsonb_build_object('revoked_count', v_updated)
  );

  RETURN json_build_object('success', true, 'revoked_count', v_updated);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_send_message(
  target_user_id uuid,
  message_subject text DEFAULT 'Mensagem da ANAPP',
  message_body text DEFAULT ''
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id uuid := auth.uid();
  v_msg_id uuid;
BEGIN
  IF v_admin_id IS NULL OR NOT public.lms_is_admin_or_master(v_admin_id) THEN
    RAISE EXCEPTION 'Acesso administrativo obrigatório.';
  END IF;

  IF NULLIF(trim(message_subject), '') IS NULL
     OR NULLIF(trim(message_body), '') IS NULL THEN
    RAISE EXCEPTION 'Assunto e mensagem são obrigatórios.';
  END IF;

  IF to_regclass('public.admin_messages') IS NOT NULL THEN
    BEGIN
      EXECUTE
        'INSERT INTO public.admin_messages (user_id, subject, message, created_at)
         VALUES ($1, $2, $3, now()) RETURNING id'
      INTO v_msg_id
      USING target_user_id, message_subject, message_body;
    EXCEPTION WHEN undefined_column THEN
      EXECUTE
        'INSERT INTO public.admin_messages (to_user_id, subject, body, created_at)
         VALUES ($1, $2, $3, now()) RETURNING id'
      INTO v_msg_id
      USING target_user_id, message_subject, message_body;
    END;
  ELSE
    UPDATE public.profiles
    SET notes = concat_ws(
          E'\n',
          NULLIF(notes, ''),
          '[' || now()::text || '] ' || message_subject || ': ' || message_body
        ),
        updated_at = now()
    WHERE id = target_user_id;
    v_msg_id := gen_random_uuid();
  END IF;

  INSERT INTO public.lms_admin_audit_log (
    actor_user_id,
    target_user_id,
    action,
    details
  )
  VALUES (
    v_admin_id,
    target_user_id,
    'admin_send_message',
    jsonb_build_object('message_id', v_msg_id, 'subject', message_subject)
  );

  RETURN json_build_object(
    'success', true,
    'message_id', v_msg_id,
    'message', 'Mensagem registrada com sucesso'
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
        'assessment_id', e.id,
        'title', e.title,
        'chapter_number', c.chapter_number,
        'best_score', s.best_score,
        'attempts_count', COALESCE(s.attempts_count, 0)
      )
      ORDER BY c.chapter_number
    ),
    '[]'::jsonb
  )
  INTO v_exams
  FROM public.exams e
  JOIN public.chapters c ON c.id = e.chapter_id
  LEFT JOIN public.user_exam_scores s
    ON s.exam_id = e.id
   AND s.user_id = target_user_id;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'assessment_id', q.id,
        'title', q.title,
        'chapter_number', c.chapter_number,
        'best_score', s.best_score,
        'attempts_count', COALESCE(s.attempts_count, 0)
      )
      ORDER BY c.chapter_number
    ),
    '[]'::jsonb
  )
  INTO v_quizzes
  FROM public.quizzes q
  JOIN public.chapters c ON c.id = q.chapter_id
  LEFT JOIN public.user_quiz_scores s
    ON s.quiz_id = q.id
   AND s.user_id = target_user_id;

  RETURN jsonb_build_object('exams', v_exams, 'quizzes', v_quizzes);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_exam_grade(
  target_user_id uuid,
  p_exam_id uuid,
  p_score numeric,
  p_reason text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id uuid := auth.uid();
  v_chapter_id integer;
  v_old_score numeric;
BEGIN
  IF v_admin_id IS NULL OR NOT public.lms_is_admin_or_master(v_admin_id) THEN
    RAISE EXCEPTION 'Acesso administrativo obrigatório.';
  END IF;
  IF p_score < 0 OR p_score > 100 THEN
    RAISE EXCEPTION 'A nota deve estar entre 0 e 100.';
  END IF;
  IF NULLIF(trim(p_reason), '') IS NULL THEN
    RAISE EXCEPTION 'A justificativa é obrigatória.';
  END IF;

  SELECT chapter_id INTO v_chapter_id
  FROM public.exams
  WHERE id = p_exam_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prova não encontrada.';
  END IF;

  SELECT best_score INTO v_old_score
  FROM public.user_exam_scores
  WHERE user_id = target_user_id
    AND exam_id = p_exam_id;

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
    target_user_id,
    p_exam_id,
    v_chapter_id,
    round(p_score, 2),
    1,
    now(),
    now()
  )
  ON CONFLICT (user_id, exam_id)
  DO UPDATE SET
    best_score = round(EXCLUDED.best_score, 2),
    attempts_count = GREATEST(public.user_exam_scores.attempts_count, 1),
    last_attempt_at = now(),
    updated_at = now();

  INSERT INTO public.lms_admin_audit_log (
    actor_user_id,
    target_user_id,
    action,
    details
  )
  VALUES (
    v_admin_id,
    target_user_id,
    'admin_update_exam_grade',
    jsonb_build_object(
      'exam_id', p_exam_id,
      'old_score', v_old_score,
      'new_score', round(p_score, 2),
      'reason', p_reason
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'old_score', v_old_score,
    'new_score', round(p_score, 2)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_quiz_grade(
  target_user_id uuid,
  p_quiz_id uuid,
  p_score numeric,
  p_reason text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id uuid := auth.uid();
  v_old_score numeric;
BEGIN
  IF v_admin_id IS NULL OR NOT public.lms_is_admin_or_master(v_admin_id) THEN
    RAISE EXCEPTION 'Acesso administrativo obrigatório.';
  END IF;
  IF p_score < 0 OR p_score > 100 THEN
    RAISE EXCEPTION 'A nota deve estar entre 0 e 100.';
  END IF;
  IF NULLIF(trim(p_reason), '') IS NULL THEN
    RAISE EXCEPTION 'A justificativa é obrigatória.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.quizzes WHERE id = p_quiz_id) THEN
    RAISE EXCEPTION 'Quiz não encontrado.';
  END IF;

  SELECT best_score INTO v_old_score
  FROM public.user_quiz_scores
  WHERE user_id = target_user_id
    AND quiz_id = p_quiz_id;

  INSERT INTO public.user_quiz_scores (
    user_id,
    quiz_id,
    best_score,
    attempts_count,
    last_attempt_at,
    updated_at
  )
  VALUES (
    target_user_id,
    p_quiz_id,
    round(p_score, 2),
    1,
    now(),
    now()
  )
  ON CONFLICT (user_id, quiz_id)
  DO UPDATE SET
    best_score = round(EXCLUDED.best_score, 2),
    attempts_count = GREATEST(public.user_quiz_scores.attempts_count, 1),
    last_attempt_at = now(),
    updated_at = now();

  INSERT INTO public.lms_admin_audit_log (
    actor_user_id,
    target_user_id,
    action,
    details
  )
  VALUES (
    v_admin_id,
    target_user_id,
    'admin_update_quiz_grade',
    jsonb_build_object(
      'quiz_id', p_quiz_id,
      'old_score', v_old_score,
      'new_score', round(p_score, 2),
      'reason', p_reason
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'old_score', v_old_score,
    'new_score', round(p_score, 2)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_grant_payment(uuid, numeric, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_revoke_payment(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_issue_certificate(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_issue_certificate(uuid, text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_revoke_certificate(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_send_message(uuid, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_list_grades(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_update_exam_grade(uuid, uuid, numeric, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_update_quiz_grade(uuid, uuid, numeric, text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.admin_grant_payment(uuid, numeric, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_revoke_payment(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_issue_certificate(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_issue_certificate(uuid, text, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_revoke_certificate(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_send_message(uuid, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_list_grades(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_update_exam_grade(uuid, uuid, numeric, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_update_quiz_grade(uuid, uuid, numeric, text) TO authenticated, service_role;

COMMIT;
