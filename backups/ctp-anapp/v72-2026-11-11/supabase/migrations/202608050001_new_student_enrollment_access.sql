BEGIN;

CREATE TABLE IF NOT EXISTS public.student_enrollments (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'email_pending'
    CHECK (status IN ('email_pending', 'chapter_zero', 'payment_pending', 'active', 'blocked')),
  email_confirmed_at timestamptz,
  payment_id uuid REFERENCES public.payments(id) ON DELETE SET NULL,
  activated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_email_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS student_email_verifications_user_idx
  ON public.student_email_verifications (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.student_email_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_key text NOT NULL,
  event_type text NOT NULL,
  status text NOT NULL DEFAULT 'sending'
    CHECK (status IN ('sending', 'sent', 'failed')),
  attempts integer NOT NULL DEFAULT 1 CHECK (attempts BETWEEN 1 AND 5),
  provider_id text,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, event_key)
);

ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_email_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_email_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.student_enrollments FROM anon, authenticated;
REVOKE ALL ON public.student_email_verifications FROM anon, authenticated;
REVOKE ALL ON public.student_email_events FROM anon, authenticated;
GRANT ALL ON public.student_enrollments TO service_role;
GRANT ALL ON public.student_email_verifications TO service_role;
GRANT ALL ON public.student_email_events TO service_role;

CREATE OR REPLACE FUNCTION public.lms_user_email_confirmed(
  check_user_id uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = check_user_id
      AND email_confirmed_at IS NOT NULL
  );
$$;

CREATE OR REPLACE FUNCTION public.lms_has_full_course_access(
  check_user_id uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT
    check_user_id IS NOT NULL
    AND public.lms_user_email_confirmed(check_user_id)
    AND NOT COALESCE((
      SELECT access_blocked FROM public.profiles WHERE id = check_user_id
    ), false)
    AND NOT COALESCE((
      SELECT access_blocked FROM public.user_roles WHERE user_id = check_user_id
    ), false)
    AND (
      public.lms_is_admin_or_master(check_user_id)
      OR COALESCE((
        SELECT is_alumni FROM public.profiles WHERE id = check_user_id
      ), false)
      OR COALESCE((
        SELECT has_paid FROM public.profiles WHERE id = check_user_id
      ), false)
      OR EXISTS (
        SELECT 1
        FROM public.payments
        WHERE user_id = check_user_id
          AND status = 'approved'
      )
    );
$$;

CREATE OR REPLACE FUNCTION public.lms_can_access_chapter(
  p_chapter_number integer,
  check_user_id uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT
    check_user_id IS NOT NULL
    AND public.lms_user_email_confirmed(check_user_id)
    AND NOT COALESCE((
      SELECT access_blocked FROM public.profiles WHERE id = check_user_id
    ), false)
    AND NOT COALESCE((
      SELECT access_blocked FROM public.user_roles WHERE user_id = check_user_id
    ), false)
    AND (
      p_chapter_number = 0
      OR public.lms_has_full_course_access(check_user_id)
    );
$$;

CREATE OR REPLACE FUNCTION public.lms_access_context()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT jsonb_build_object(
    'authenticated', auth.uid() IS NOT NULL,
    'email_confirmed', public.lms_user_email_confirmed(auth.uid()),
    'is_admin', public.lms_is_admin_or_master(auth.uid()),
    'is_alumni', COALESCE((SELECT is_alumni FROM public.profiles WHERE id = auth.uid()), false),
    'has_paid', COALESCE((SELECT has_paid FROM public.profiles WHERE id = auth.uid()), false)
      OR EXISTS (SELECT 1 FROM public.payments WHERE user_id = auth.uid() AND status = 'approved'),
    'access_blocked', COALESCE((SELECT access_blocked FROM public.profiles WHERE id = auth.uid()), false)
      OR COALESCE((SELECT access_blocked FROM public.user_roles WHERE user_id = auth.uid()), false),
    'can_access_chapter_zero', public.lms_can_access_chapter(0, auth.uid()),
    'can_access_paid_content', public.lms_has_full_course_access(auth.uid()),
    'enrollment_status', COALESCE(
      (SELECT status FROM public.student_enrollments WHERE user_id = auth.uid()),
      CASE
        WHEN public.lms_has_full_course_access(auth.uid()) THEN 'active'
        WHEN public.lms_user_email_confirmed(auth.uid()) THEN 'chapter_zero'
        ELSE 'email_pending'
      END
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.lms_activate_paid_access(
  p_user_id uuid,
  p_payment_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.payments
    WHERE id = p_payment_id
      AND user_id = p_user_id
      AND status = 'approved'
  ) THEN
    RAISE EXCEPTION 'APPROVED_PAYMENT_REQUIRED';
  END IF;

  UPDATE public.profiles
  SET has_paid = true, updated_at = now()
  WHERE id = p_user_id;

  INSERT INTO public.student_enrollments (
    user_id, status, email_confirmed_at, payment_id, activated_at, updated_at
  )
  SELECT
    u.id, 'active', u.email_confirmed_at, p_payment_id, now(), now()
  FROM auth.users u
  WHERE u.id = p_user_id
    AND u.email_confirmed_at IS NOT NULL
  ON CONFLICT (user_id) DO UPDATE
  SET status = 'active',
      email_confirmed_at = EXCLUDED.email_confirmed_at,
      payment_id = EXCLUDED.payment_id,
      activated_at = COALESCE(public.student_enrollments.activated_at, now()),
      updated_at = now();

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.lms_claim_email_event(
  p_user_id uuid,
  p_event_key text,
  p_event_type text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.student_email_events (
    user_id, event_key, event_type, status
  )
  VALUES (p_user_id, p_event_key, p_event_type, 'sending')
  ON CONFLICT (user_id, event_key) DO UPDATE
  SET status = 'sending',
      attempts = public.student_email_events.attempts + 1,
      last_error = NULL,
      updated_at = now()
  WHERE public.student_email_events.status = 'failed'
    AND public.student_email_events.attempts < 5
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.lms_sync_enrollment_from_auth()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_full_access boolean;
BEGIN
  v_full_access := public.lms_has_full_course_access(NEW.id);

  INSERT INTO public.student_enrollments (
    user_id, status, email_confirmed_at, activated_at, updated_at
  )
  VALUES (
    NEW.id,
    CASE
      WHEN NEW.email_confirmed_at IS NULL THEN 'email_pending'
      WHEN v_full_access THEN 'active'
      ELSE 'chapter_zero'
    END,
    NEW.email_confirmed_at,
    CASE WHEN v_full_access THEN now() ELSE NULL END,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE
  SET email_confirmed_at = EXCLUDED.email_confirmed_at,
      status = CASE
        WHEN public.student_enrollments.status = 'blocked' THEN 'blocked'
        WHEN EXCLUDED.email_confirmed_at IS NULL THEN 'email_pending'
        WHEN v_full_access THEN 'active'
        ELSE 'chapter_zero'
      END,
      activated_at = CASE
        WHEN v_full_access THEN COALESCE(public.student_enrollments.activated_at, now())
        ELSE public.student_enrollments.activated_at
      END,
      updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_lms_sync_enrollment_from_auth ON auth.users;
CREATE TRIGGER trg_lms_sync_enrollment_from_auth
  AFTER INSERT OR UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.lms_sync_enrollment_from_auth();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.student_enrollments (
  user_id, status, email_confirmed_at, payment_id, activated_at
)
SELECT
  u.id,
  CASE
    WHEN u.email_confirmed_at IS NULL THEN 'email_pending'
    WHEN public.lms_has_full_course_access(u.id) THEN 'active'
    ELSE 'chapter_zero'
  END,
  u.email_confirmed_at,
  paid.id,
  CASE WHEN public.lms_has_full_course_access(u.id) THEN now() ELSE NULL END
FROM auth.users u
LEFT JOIN LATERAL (
  SELECT id
  FROM public.payments
  WHERE user_id = u.id AND status = 'approved'
  ORDER BY paid_at DESC NULLS LAST, created_at DESC
  LIMIT 1
) paid ON true
ON CONFLICT (user_id) DO UPDATE
SET email_confirmed_at = EXCLUDED.email_confirmed_at,
    payment_id = COALESCE(public.student_enrollments.payment_id, EXCLUDED.payment_id),
    status = CASE
      WHEN public.student_enrollments.status = 'blocked' THEN 'blocked'
      ELSE EXCLUDED.status
    END,
    activated_at = COALESCE(public.student_enrollments.activated_at, EXCLUDED.activated_at),
    updated_at = now();

REVOKE ALL ON FUNCTION public.lms_user_email_confirmed(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.lms_has_full_course_access(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.lms_can_access_chapter(integer, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.lms_access_context() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.lms_activate_paid_access(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.lms_claim_email_event(uuid, text, text) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.lms_user_email_confirmed(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.lms_has_full_course_access(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.lms_can_access_chapter(integer, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.lms_access_context() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.lms_activate_paid_access(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.lms_claim_email_event(uuid, text, text) TO service_role;

ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.chapters FROM anon;
GRANT SELECT ON public.chapters TO authenticated, service_role;

DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'chapters'
      AND cmd IN ('SELECT', 'ALL')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.chapters', p.policyname);
  END LOOP;
END $$;

CREATE POLICY chapters_by_enrollment
  ON public.chapters
  FOR SELECT
  TO authenticated
  USING (public.lms_can_access_chapter(chapter_number, auth.uid()));

CREATE POLICY chapters_service_all
  ON public.chapters
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DO $$
DECLARE
  v_table text;
  p record;
BEGIN
  FOREACH v_table IN ARRAY ARRAY['exams', 'quizzes', 'quiz_questions']
  LOOP
    IF to_regclass('public.' || v_table) IS NULL THEN
      CONTINUE;
    END IF;
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', v_table);
    FOR p IN
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = v_table
        AND cmd IN ('SELECT', 'ALL')
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p.policyname, v_table);
    END LOOP;
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', v_table);
    EXECUTE format('GRANT SELECT ON public.%I TO authenticated, service_role', v_table);
  END LOOP;
END $$;

CREATE POLICY exams_paid_access
  ON public.exams FOR SELECT TO authenticated
  USING (public.lms_has_full_course_access(auth.uid()));

CREATE POLICY quizzes_paid_access
  ON public.quizzes FOR SELECT TO authenticated
  USING (public.lms_has_full_course_access(auth.uid()));

CREATE POLICY quiz_questions_paid_access
  ON public.quiz_questions FOR SELECT TO authenticated
  USING (public.lms_has_full_course_access(auth.uid()));

COMMIT;
