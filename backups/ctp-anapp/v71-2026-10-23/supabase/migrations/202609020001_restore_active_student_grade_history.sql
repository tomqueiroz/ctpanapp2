BEGIN;

-- CTP ANAPP — recuperação auditável do histórico acadêmico dos alunos ativos.
-- A regra atual permanece 70%. Aprovações obtidas antes de 01/09/2026
-- continuam válidas para histórico, progresso e desbloqueio sequencial.

CREATE TABLE IF NOT EXISTS public.lms_grade_policy_recovery_batches (
  batch_key text PRIMARY KEY,
  cutoff_at timestamptz NOT NULL,
  backup_exported_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'failed')),
  backup_progress_rows integer NOT NULL DEFAULT 0,
  active_students_considered integer NOT NULL DEFAULT 0,
  historical_exam_approvals integer NOT NULL DEFAULT 0,
  historical_quiz_approvals integer NOT NULL DEFAULT 0,
  restored_exam_attempts integer NOT NULL DEFAULT 0,
  restored_progress_rows integer NOT NULL DEFAULT 0,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.lms_grade_policy_recovery_snapshots (
  batch_key text NOT NULL
    REFERENCES public.lms_grade_policy_recovery_batches(batch_key)
    ON DELETE RESTRICT,
  entity_type text NOT NULL
    CHECK (entity_type IN ('exam_attempt', 'user_progress')),
  entity_id uuid NOT NULL,
  user_id uuid NOT NULL,
  state jsonb NOT NULL,
  captured_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (batch_key, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS lms_grade_recovery_snapshot_user_idx
  ON public.lms_grade_policy_recovery_snapshots
  (user_id, captured_at DESC);

CREATE TABLE IF NOT EXISTS public.lms_historical_assessment_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL
    REFERENCES auth.users(id)
    ON DELETE CASCADE,
  assessment_type text NOT NULL
    CHECK (assessment_type IN ('exam', 'quiz')),
  assessment_id uuid NOT NULL,
  chapter_id integer NOT NULL
    REFERENCES public.chapters(id)
    ON DELETE CASCADE,
  score numeric NOT NULL
    CHECK (score >= 0 AND score <= 100),
  approved_at timestamptz NOT NULL,
  historical_passing_score integer NOT NULL DEFAULT 60,
  current_passing_score integer NOT NULL DEFAULT 70,
  source text NOT NULL DEFAULT 'grade_policy_recovery_20260902',
  recovery_batch_key text
    REFERENCES public.lms_grade_policy_recovery_batches(batch_key)
    ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, assessment_type, assessment_id)
);

CREATE INDEX IF NOT EXISTS lms_historical_approval_user_chapter_idx
  ON public.lms_historical_assessment_approvals
  (user_id, chapter_id, assessment_type);

CREATE OR REPLACE FUNCTION public.lms_is_active_student(
  p_user_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE(role.role, 'student') = 'student'
    AND NOT COALESCE(role.access_blocked, false)
    AND (
      COALESCE(profile.has_paid, false)
      OR EXISTS (
        SELECT 1
        FROM public.payments payment
        WHERE payment.user_id = p_user_id
          AND payment.status = 'approved'
      )
      OR EXISTS (
        SELECT 1
        FROM public.student_enrollments enrollment
        WHERE enrollment.user_id = p_user_id
          AND enrollment.status IN ('active', 'email_pending')
      )
    )
  FROM (SELECT p_user_id AS user_id) subject
  LEFT JOIN public.user_roles role
    ON role.user_id = subject.user_id
  LEFT JOIN public.profiles profile
    ON profile.id = subject.user_id;
$$;

CREATE OR REPLACE FUNCTION public.lms_has_historical_assessment_approval(
  p_user_id uuid,
  p_assessment_type text,
  p_assessment_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.lms_historical_assessment_approvals approval
    WHERE approval.user_id = p_user_id
      AND approval.assessment_type = p_assessment_type
      AND approval.assessment_id = p_assessment_id
  );
$$;

CREATE OR REPLACE FUNCTION public.lms_has_historical_chapter_approval(
  p_user_id uuid,
  p_chapter_id integer
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.lms_historical_assessment_approvals approval
    WHERE approval.user_id = p_user_id
      AND approval.chapter_id = p_chapter_id
  );
$$;

ALTER TABLE public.lms_grade_policy_recovery_batches
  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_grade_policy_recovery_snapshots
  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_historical_assessment_approvals
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.lms_grade_policy_recovery_batches
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.lms_grade_policy_recovery_snapshots
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.lms_historical_assessment_approvals
  FROM PUBLIC, anon, authenticated;

GRANT SELECT ON public.lms_grade_policy_recovery_batches
  TO authenticated;
GRANT SELECT ON public.lms_grade_policy_recovery_snapshots
  TO authenticated;
GRANT SELECT ON public.lms_historical_assessment_approvals
  TO authenticated;
GRANT ALL ON public.lms_grade_policy_recovery_batches
  TO service_role;
GRANT ALL ON public.lms_grade_policy_recovery_snapshots
  TO service_role;
GRANT ALL ON public.lms_historical_assessment_approvals
  TO service_role;

DROP POLICY IF EXISTS lms_grade_recovery_batches_admin_read
  ON public.lms_grade_policy_recovery_batches;
CREATE POLICY lms_grade_recovery_batches_admin_read
  ON public.lms_grade_policy_recovery_batches
  FOR SELECT
  TO authenticated
  USING (public.lms_is_admin_or_master(auth.uid()));

DROP POLICY IF EXISTS lms_grade_recovery_snapshots_admin_read
  ON public.lms_grade_policy_recovery_snapshots;
CREATE POLICY lms_grade_recovery_snapshots_admin_read
  ON public.lms_grade_policy_recovery_snapshots
  FOR SELECT
  TO authenticated
  USING (public.lms_is_admin_or_master(auth.uid()));

DROP POLICY IF EXISTS lms_historical_approvals_own_or_admin_read
  ON public.lms_historical_assessment_approvals;
CREATE POLICY lms_historical_approvals_own_or_admin_read
  ON public.lms_historical_assessment_approvals
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.lms_is_admin_or_master(auth.uid())
  );

DROP POLICY IF EXISTS lms_grade_recovery_batches_service_all
  ON public.lms_grade_policy_recovery_batches;
CREATE POLICY lms_grade_recovery_batches_service_all
  ON public.lms_grade_policy_recovery_batches
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS lms_grade_recovery_snapshots_service_all
  ON public.lms_grade_policy_recovery_snapshots;
CREATE POLICY lms_grade_recovery_snapshots_service_all
  ON public.lms_grade_policy_recovery_snapshots
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS lms_historical_approvals_service_all
  ON public.lms_historical_assessment_approvals;
CREATE POLICY lms_historical_approvals_service_all
  ON public.lms_historical_assessment_approvals
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.lms_restore_active_student_grade_history(
  p_batch_key text,
  p_cutoff_at timestamptz,
  p_backup_exported_at timestamptz,
  p_backup_progress jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_existing_status text;
  v_active_students integer := 0;
  v_exam_approvals integer := 0;
  v_quiz_approvals integer := 0;
  v_restored_attempts integer := 0;
  v_restored_progress integer := 0;
  v_additional_progress integer := 0;
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'Service role obrigatória para a recuperação acadêmica.';
  END IF;

  IF NULLIF(btrim(p_batch_key), '') IS NULL THEN
    RAISE EXCEPTION 'Identificador do lote obrigatório.';
  END IF;

  IF p_backup_progress IS NULL
     OR jsonb_typeof(p_backup_progress) <> 'array' THEN
    RAISE EXCEPTION 'Snapshot de progresso inválido.';
  END IF;

  SELECT status
  INTO v_existing_status
  FROM public.lms_grade_policy_recovery_batches
  WHERE batch_key = p_batch_key;

  IF v_existing_status = 'completed' THEN
    RETURN (
      SELECT jsonb_build_object(
        'batch_key', batch.batch_key,
        'status', batch.status,
        'active_students_considered', batch.active_students_considered,
        'historical_exam_approvals', batch.historical_exam_approvals,
        'historical_quiz_approvals', batch.historical_quiz_approvals,
        'restored_exam_attempts', batch.restored_exam_attempts,
        'restored_progress_rows', batch.restored_progress_rows,
        'idempotent_replay', true
      )
      FROM public.lms_grade_policy_recovery_batches batch
      WHERE batch.batch_key = p_batch_key
    );
  END IF;

  INSERT INTO public.lms_grade_policy_recovery_batches (
    batch_key,
    cutoff_at,
    backup_exported_at,
    status,
    backup_progress_rows
  )
  VALUES (
    p_batch_key,
    p_cutoff_at,
    p_backup_exported_at,
    'pending',
    jsonb_array_length(p_backup_progress)
  )
  ON CONFLICT (batch_key)
  DO UPDATE SET
    cutoff_at = EXCLUDED.cutoff_at,
    backup_exported_at = EXCLUDED.backup_exported_at,
    backup_progress_rows = EXCLUDED.backup_progress_rows,
    status = 'pending';

  SELECT count(*)
  INTO v_active_students
  FROM auth.users auth_user
  WHERE public.lms_is_active_student(auth_user.id);

  INSERT INTO public.lms_grade_policy_recovery_snapshots (
    batch_key,
    entity_type,
    entity_id,
    user_id,
    state
  )
  SELECT
    p_batch_key,
    'exam_attempt',
    attempt.id,
    attempt.user_id,
    to_jsonb(attempt)
  FROM public.exam_attempts attempt
  WHERE public.lms_is_active_student(attempt.user_id)
    AND COALESCE(
      attempt.completed_at,
      attempt.created_at,
      attempt.started_at
    ) < p_cutoff_at
    AND COALESCE(attempt.score, 0) >= 60
    AND COALESCE(attempt.score, 0) < 70
  ON CONFLICT (batch_key, entity_type, entity_id)
  DO NOTHING;

  WITH backup_rows AS (
    SELECT *
    FROM jsonb_to_recordset(p_backup_progress) AS backup (
      id uuid,
      user_id uuid,
      chapter_id integer,
      video_completed boolean,
      apostila_completed boolean,
      podcast_completed boolean,
      quiz_completed boolean,
      materials_completed boolean,
      slides_completed boolean,
      completion_percentage numeric,
      completed_at timestamptz,
      last_accessed_at timestamptz,
      created_at timestamptz
    )
  )
  INSERT INTO public.lms_grade_policy_recovery_snapshots (
    batch_key,
    entity_type,
    entity_id,
    user_id,
    state
  )
  SELECT
    p_batch_key,
    'user_progress',
    progress.id,
    progress.user_id,
    to_jsonb(progress)
  FROM backup_rows backup
  JOIN public.user_progress progress
    ON progress.id = backup.id
   AND progress.user_id = backup.user_id
  WHERE public.lms_is_active_student(progress.user_id)
  ON CONFLICT (batch_key, entity_type, entity_id)
  DO NOTHING;

  INSERT INTO public.lms_historical_assessment_approvals (
    user_id,
    assessment_type,
    assessment_id,
    chapter_id,
    score,
    approved_at,
    historical_passing_score,
    current_passing_score,
    source,
    recovery_batch_key
  )
  SELECT
    attempt.user_id,
    'exam',
    attempt.exam_id,
    exam.chapter_id,
    max(attempt.score),
    min(
      COALESCE(
        attempt.completed_at,
        attempt.created_at,
        attempt.started_at
      )
    ),
    60,
    70,
    'exam_attempt_before_policy_change',
    p_batch_key
  FROM public.exam_attempts attempt
  JOIN public.exams exam
    ON exam.id = attempt.exam_id
  WHERE public.lms_is_active_student(attempt.user_id)
    AND COALESCE(
      attempt.completed_at,
      attempt.created_at,
      attempt.started_at
    ) < p_cutoff_at
    AND COALESCE(attempt.score, 0) >= 60
    AND COALESCE(attempt.score, 0) < 70
  GROUP BY
    attempt.user_id,
    attempt.exam_id,
    exam.chapter_id
  ON CONFLICT (user_id, assessment_type, assessment_id)
  DO UPDATE SET
    score = GREATEST(
      public.lms_historical_assessment_approvals.score,
      EXCLUDED.score
    ),
    approved_at = LEAST(
      public.lms_historical_assessment_approvals.approved_at,
      EXCLUDED.approved_at
    ),
    recovery_batch_key = EXCLUDED.recovery_batch_key;

  GET DIAGNOSTICS v_exam_approvals = ROW_COUNT;

  INSERT INTO public.lms_historical_assessment_approvals (
    user_id,
    assessment_type,
    assessment_id,
    chapter_id,
    score,
    approved_at,
    historical_passing_score,
    current_passing_score,
    source,
    recovery_batch_key
  )
  SELECT
    score.user_id,
    'quiz',
    score.quiz_id,
    quiz.chapter_id,
    score.best_score,
    COALESCE(score.last_attempt_at, score.updated_at, score.created_at),
    60,
    70,
    'quiz_score_before_policy_change',
    p_batch_key
  FROM public.user_quiz_scores score
  JOIN public.quizzes quiz
    ON quiz.id = score.quiz_id
  WHERE public.lms_is_active_student(score.user_id)
    AND COALESCE(
      score.last_attempt_at,
      score.updated_at,
      score.created_at
    ) < p_cutoff_at
    AND COALESCE(score.best_score, 0) >= 60
    AND COALESCE(score.best_score, 0) < 70
  ON CONFLICT (user_id, assessment_type, assessment_id)
  DO UPDATE SET
    score = GREATEST(
      public.lms_historical_assessment_approvals.score,
      EXCLUDED.score
    ),
    approved_at = LEAST(
      public.lms_historical_assessment_approvals.approved_at,
      EXCLUDED.approved_at
    ),
    recovery_batch_key = EXCLUDED.recovery_batch_key;

  GET DIAGNOSTICS v_quiz_approvals = ROW_COUNT;

  UPDATE public.exam_attempts attempt
  SET is_passed = true
  WHERE public.lms_is_active_student(attempt.user_id)
    AND COALESCE(
      attempt.completed_at,
      attempt.created_at,
      attempt.started_at
    ) < p_cutoff_at
    AND COALESCE(attempt.score, 0) >= 60
    AND COALESCE(attempt.score, 0) < 70
    AND attempt.is_passed IS DISTINCT FROM true;

  GET DIAGNOSTICS v_restored_attempts = ROW_COUNT;

  WITH backup_rows AS (
    SELECT *
    FROM jsonb_to_recordset(p_backup_progress) AS backup (
      id uuid,
      user_id uuid,
      chapter_id integer,
      video_completed boolean,
      apostila_completed boolean,
      podcast_completed boolean,
      quiz_completed boolean,
      materials_completed boolean,
      slides_completed boolean,
      completion_percentage numeric,
      completed_at timestamptz,
      last_accessed_at timestamptz,
      created_at timestamptz
    )
  ),
  merged AS (
    SELECT
      progress.id,
      backup.completion_percentage AS backup_percentage,
      backup.completed_at AS backup_completed_at,
      (
        COALESCE(progress.video_completed, false)::integer
        + COALESCE(progress.apostila_completed, false)::integer
        + COALESCE(progress.podcast_completed, false)::integer
        + COALESCE(progress.materials_completed, false)::integer
        + COALESCE(progress.slides_completed, false)::integer
        + (
          COALESCE(progress.quiz_completed, false)
          OR COALESCE(backup.quiz_completed, false)
          OR public.lms_has_historical_chapter_approval(
            progress.user_id,
            progress.chapter_id
          )
        )::integer
      ) AS completed_requirements
    FROM backup_rows backup
    JOIN public.user_progress progress
      ON progress.id = backup.id
     AND progress.user_id = backup.user_id
    WHERE public.lms_is_active_student(progress.user_id)
  )
  UPDATE public.user_progress progress
  SET
    quiz_completed = (
      COALESCE(progress.quiz_completed, false)
      OR public.lms_has_historical_chapter_approval(
        progress.user_id,
        progress.chapter_id
      )
    ),
    completion_percentage = GREATEST(
      COALESCE(progress.completion_percentage, 0),
      COALESCE(merged.backup_percentage, 0),
      round(merged.completed_requirements * 100.0 / 6)
    ),
    completed_at = CASE
      WHEN merged.completed_requirements = 6
        THEN COALESCE(
          progress.completed_at,
          merged.backup_completed_at,
          progress.last_accessed_at,
          now()
        )
      ELSE progress.completed_at
    END
  FROM merged
  WHERE progress.id = merged.id;

  GET DIAGNOSTICS v_restored_progress = ROW_COUNT;

  WITH historical_chapters AS (
    SELECT DISTINCT approval.user_id, approval.chapter_id
    FROM public.lms_historical_assessment_approvals approval
    WHERE approval.recovery_batch_key = p_batch_key
  ),
  calculated AS (
    SELECT
      progress.id,
      (
        COALESCE(progress.video_completed, false)::integer
        + COALESCE(progress.apostila_completed, false)::integer
        + COALESCE(progress.podcast_completed, false)::integer
        + COALESCE(progress.materials_completed, false)::integer
        + COALESCE(progress.slides_completed, false)::integer
        + 1
      ) AS completed_requirements
    FROM historical_chapters historical
    JOIN public.user_progress progress
      ON progress.user_id = historical.user_id
     AND progress.chapter_id = historical.chapter_id
    WHERE public.lms_is_active_student(progress.user_id)
  )
  UPDATE public.user_progress progress
  SET
    quiz_completed = true,
    completion_percentage = GREATEST(
      COALESCE(progress.completion_percentage, 0),
      round(calculated.completed_requirements * 100.0 / 6)
    ),
    completed_at = CASE
      WHEN calculated.completed_requirements = 6
        THEN COALESCE(
          progress.completed_at,
          progress.last_accessed_at,
          now()
        )
      ELSE progress.completed_at
    END
  FROM calculated
  WHERE progress.id = calculated.id;

  GET DIAGNOSTICS v_additional_progress = ROW_COUNT;
  v_restored_progress := v_restored_progress + v_additional_progress;

  UPDATE public.lms_grade_policy_recovery_batches
  SET
    status = 'completed',
    active_students_considered = v_active_students,
    historical_exam_approvals = (
      SELECT count(*)
      FROM public.lms_historical_assessment_approvals approval
      WHERE approval.recovery_batch_key = p_batch_key
        AND approval.assessment_type = 'exam'
    ),
    historical_quiz_approvals = (
      SELECT count(*)
      FROM public.lms_historical_assessment_approvals approval
      WHERE approval.recovery_batch_key = p_batch_key
        AND approval.assessment_type = 'quiz'
    ),
    restored_exam_attempts = v_restored_attempts,
    restored_progress_rows = v_restored_progress,
    details = jsonb_build_object(
      'policy_before', 60,
      'policy_current', 70,
      'certificate_policy', 70,
      'raw_scores_changed', false,
      'inactive_students_changed', false
    ),
    completed_at = now()
  WHERE batch_key = p_batch_key;

  INSERT INTO public.lms_admin_audit_log (
    actor_user_id,
    target_user_id,
    action,
    details
  )
  VALUES (
    NULL,
    NULL,
    'grade_policy_history_recovered',
    jsonb_build_object(
      'batch_key', p_batch_key,
      'cutoff_at', p_cutoff_at,
      'backup_exported_at', p_backup_exported_at,
      'active_students_considered', v_active_students,
      'historical_exam_approvals', (
        SELECT count(*)
        FROM public.lms_historical_assessment_approvals approval
        WHERE approval.recovery_batch_key = p_batch_key
          AND approval.assessment_type = 'exam'
      ),
      'historical_quiz_approvals', (
        SELECT count(*)
        FROM public.lms_historical_assessment_approvals approval
        WHERE approval.recovery_batch_key = p_batch_key
          AND approval.assessment_type = 'quiz'
      ),
      'restored_exam_attempts', v_restored_attempts,
      'restored_progress_rows', v_restored_progress,
      'minimum_score_preserved', 70
    )
  );

  RETURN (
    SELECT jsonb_build_object(
      'batch_key', batch.batch_key,
      'status', batch.status,
      'active_students_considered', batch.active_students_considered,
      'historical_exam_approvals', batch.historical_exam_approvals,
      'historical_quiz_approvals', batch.historical_quiz_approvals,
      'restored_exam_attempts', batch.restored_exam_attempts,
      'restored_progress_rows', batch.restored_progress_rows,
      'minimum_score', 70,
      'raw_scores_changed', false
    )
    FROM public.lms_grade_policy_recovery_batches batch
    WHERE batch.batch_key = p_batch_key
  );
EXCEPTION
  WHEN OTHERS THEN
    UPDATE public.lms_grade_policy_recovery_batches
    SET
      status = 'failed',
      details = jsonb_build_object(
        'error', SQLERRM,
        'failed_at', now()
      )
    WHERE batch_key = p_batch_key;
    RAISE;
END;
$$;

REVOKE ALL ON FUNCTION public.lms_is_active_student(uuid)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.lms_has_historical_assessment_approval(
  uuid,
  text,
  uuid
) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.lms_has_historical_chapter_approval(
  uuid,
  integer
) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.lms_restore_active_student_grade_history(
  text,
  timestamptz,
  timestamptz,
  jsonb
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.lms_is_active_student(uuid)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.lms_has_historical_assessment_approval(
  uuid,
  text,
  uuid
) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.lms_has_historical_chapter_approval(
  uuid,
  integer
) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.lms_restore_active_student_grade_history(
  text,
  timestamptz,
  timestamptz,
  jsonb
) TO service_role;

COMMENT ON TABLE public.lms_historical_assessment_approvals IS
  'Aprovações acadêmicas adquiridas antes da mudança da nota mínima para 70%. Preserva histórico e progressão sem alterar a nota bruta.';

COMMENT ON FUNCTION public.lms_restore_active_student_grade_history(
  text,
  timestamptz,
  timestamptz,
  jsonb
) IS
  'Restaura de forma idempotente o histórico dos alunos ativos afetados pela mudança para nota mínima 70%, mantendo 70% para novas aprovações e certificação.';

COMMIT;
