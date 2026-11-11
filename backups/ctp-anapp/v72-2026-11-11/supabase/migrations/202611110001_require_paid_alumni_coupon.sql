-- CTP ANAPP — ex-aluno não recebe acesso gratuito automático.
--
-- A classificação histórica de ex-aluno permanece disponível para auditoria,
-- mas o acesso ao curso exige pagamento aprovado. O cupom comercial associado
-- ao cadastro é apresentado no checkout e validado pela Edge Function Rede.

BEGIN;

-- Remove a trava de configuração antiga. A Edge Function continua exigindo
-- secrets, ambiente, PV e modo de preço consistentes antes de cobrar.
UPDATE public.system_settings
SET value = 'true',
    updated_at = now()
WHERE key = 'erede_enabled';

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS registration_coupon_code TEXT;

CREATE INDEX IF NOT EXISTS profiles_registration_coupon_code_idx
  ON public.profiles (registration_coupon_code)
  WHERE registration_coupon_code IS NOT NULL;

-- Reclassifica registros históricos que receberam matrícula ativa somente por
-- serem ex-alunos. Pagamentos aprovados existentes permanecem intactos.
UPDATE public.profiles p
SET has_paid = false,
    updated_at = now()
WHERE p.is_alumni = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.payments pay
    WHERE pay.user_id = p.id
      AND pay.status = 'approved'
  );

UPDATE public.student_enrollments enrollment
SET status = CASE
      WHEN public.lms_user_email_confirmed(enrollment.user_id)
        THEN 'chapter_zero'
      ELSE 'email_pending'
    END,
    payment_id = NULL,
    activated_at = NULL,
    updated_at = now()
FROM public.profiles p
WHERE enrollment.user_id = p.id
  AND p.is_alumni = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.payments pay
    WHERE pay.user_id = p.id
      AND pay.status = 'approved'
  )
  AND enrollment.status <> 'blocked';

CREATE OR REPLACE FUNCTION public.protect_profile_access_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, auth
AS $$
BEGIN
  IF auth.role() = 'authenticated' AND NOT public.is_admin() THEN
    IF TG_OP = 'INSERT' THEN
      NEW.has_paid := FALSE;
      NEW.is_anapp_member := FALSE;
      NEW.access_blocked := FALSE;
      NEW.notes := NULL;
      NEW.is_alumni := FALSE;
      NEW.alumni_type := NULL;
      NEW.registration_cohort := 'new_2026';
      NEW.registration_coupon_code := NULL;
    ELSE
      IF NEW.email IS DISTINCT FROM OLD.email
        OR NEW.has_paid IS DISTINCT FROM OLD.has_paid
        OR NEW.is_anapp_member IS DISTINCT FROM OLD.is_anapp_member
        OR NEW.access_blocked IS DISTINCT FROM OLD.access_blocked
        OR NEW.notes IS DISTINCT FROM OLD.notes
        OR NEW.is_alumni IS DISTINCT FROM OLD.is_alumni
        OR NEW.alumni_type IS DISTINCT FROM OLD.alumni_type
        OR NEW.registration_cohort IS DISTINCT FROM OLD.registration_cohort
        OR NEW.registration_coupon_code IS DISTINCT FROM OLD.registration_coupon_code
      THEN
        RAISE EXCEPTION 'Campos administrativos do perfil não podem ser alterados pelo usuário'
          USING ERRCODE = '42501';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
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
      OR EXISTS (
        SELECT 1 FROM public.payments
        WHERE user_id = auth.uid() AND status = 'approved'
      ),
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

CREATE OR REPLACE FUNCTION public.check_alumni_and_grant_access(
  p_user_id uuid,
  p_email text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_alumni public.alumni_whitelist%ROWTYPE;
  v_auth_email text;
  v_is_certified boolean;
BEGIN
  SELECT lower(trim(email))
  INTO v_auth_email
  FROM auth.users
  WHERE id = p_user_id;

  IF v_auth_email IS NULL OR v_auth_email <> lower(trim(p_email)) THEN
    RAISE EXCEPTION 'USER_EMAIL_MISMATCH';
  END IF;

  SELECT *
  INTO v_alumni
  FROM public.alumni_whitelist
  WHERE lower(trim(email)) = v_auth_email;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'is_alumni', false,
      'access_granted_without_payment', false
    );
  END IF;

  IF v_alumni.linked_user_id IS NOT NULL
     AND v_alumni.linked_user_id <> p_user_id THEN
    RAISE EXCEPTION 'ALUMNI_ALREADY_LINKED';
  END IF;

  v_is_certified :=
    v_alumni.alumni_type IN ('certified_professional', 'alumni_certified');

  UPDATE public.alumni_whitelist
  SET linked_user_id = p_user_id,
      linked_at = COALESCE(linked_at, now())
  WHERE id = v_alumni.id;

  INSERT INTO public.profiles (
    id, email, full_name, has_paid, is_anapp_member,
    is_alumni, alumni_type, registration_cohort, registration_coupon_code
  )
  VALUES (
    p_user_id,
    v_auth_email,
    v_alumni.full_name,
    false,
    v_is_certified,
    true,
    v_alumni.alumni_type,
    'pre_2026',
    'ANAPPFRIDAY'
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
      is_anapp_member = public.profiles.is_anapp_member OR EXCLUDED.is_anapp_member,
      is_alumni = true,
      alumni_type = EXCLUDED.alumni_type,
      registration_cohort = 'pre_2026',
      registration_coupon_code = COALESCE(
        public.profiles.registration_coupon_code,
        EXCLUDED.registration_coupon_code
      ),
      updated_at = now();

  INSERT INTO public.user_roles (
    user_id, role, is_anapp_member, access_blocked,
    full_name, user_origin, origin_date, alumni_whitelist_id
  )
  VALUES (
    p_user_id,
    'student',
    v_is_certified,
    false,
    v_alumni.full_name,
    v_alumni.alumni_type,
    CURRENT_DATE,
    v_alumni.id
  )
  ON CONFLICT (user_id) DO UPDATE
  SET is_anapp_member = public.user_roles.is_anapp_member OR EXCLUDED.is_anapp_member,
      full_name = COALESCE(public.user_roles.full_name, EXCLUDED.full_name),
      user_origin = CASE
        WHEN public.user_roles.role IN ('admin', 'master_admin')
          THEN public.user_roles.user_origin
        ELSE EXCLUDED.user_origin
      END,
      origin_date = CASE
        WHEN public.user_roles.role IN ('admin', 'master_admin')
          THEN public.user_roles.origin_date
        ELSE EXCLUDED.origin_date
      END,
      alumni_whitelist_id = EXCLUDED.alumni_whitelist_id;

  RETURN jsonb_build_object(
    'is_alumni', true,
    'alumni_type', v_alumni.alumni_type,
    'coupon_code', 'ANAPPFRIDAY',
    'access_granted_without_payment', false
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
  v_has_approved_payment boolean;
BEGIN
  IF v_admin_id IS NULL OR NOT public.lms_is_admin_or_master(v_admin_id) THEN
    RAISE EXCEPTION 'Acesso administrativo obrigatório.';
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
      activated_at = CASE WHEN v_has_approved_payment THEN activated_at ELSE NULL END,
      updated_at = now()
  WHERE user_id = target_user_id;

  INSERT INTO public.lms_admin_audit_log (
    actor_user_id, target_user_id, action, details
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

CREATE OR REPLACE VIEW public.admin_users_view
WITH (security_barrier = true)
AS
SELECT
  au.id,
  au.email,
  au.created_at,
  au.last_sign_in_at,
  au.email_confirmed_at,
  COALESCE(ur.role, 'student'::varchar) AS role,
  COALESCE(ur.is_anapp_member, false) AS is_anapp_member,
  COALESCE(ur.access_blocked, false) AS access_blocked,
  ur.full_name,
  ur.notes,
  COALESCE(ur.user_origin, 'new_student') AS user_origin,
  ur.origin_date,
  ur.alumni_whitelist_id,
  COALESCE(pr.is_alumni, false) AS is_alumni,
  CASE COALESCE(ur.user_origin, 'new_student')
    WHEN 'alumni' THEN 'Ex-Aluno'
    WHEN 'certified_professional' THEN 'Profissional Certificado'
    WHEN 'alumni_certified' THEN 'Ex-Aluno Certificado'
    WHEN 'admin' THEN 'Admin'
    WHEN 'invited' THEN 'Convidado'
    ELSE 'Aluno Novo'
  END AS user_tag,
  (paid.id IS NOT NULL) AS has_paid,
  paid.amount AS payment_amount,
  paid.status AS payment_status,
  paid.payment_method,
  paid.created_at AS payment_date,
  cert.id AS certificate_id,
  cert.certificate_number,
  cert.completion_date AS certificate_date,
  cert.is_valid AS certificate_is_valid,
  COALESCE(
    paid.amount = 0
      OR paid.payment_method IN ('admin_free_access', 'legacy_free_access'),
    false
  ) AS access_granted_without_payment,
  COALESCE(pr.is_alumni, false) AS email_locked,
  pr.alumni_type,
  pr.registration_cohort
FROM auth.users au
LEFT JOIN public.user_roles ur ON ur.user_id = au.id
LEFT JOIN public.profiles pr ON pr.id = au.id
LEFT JOIN LATERAL (
  SELECT p.*
  FROM public.payments p
  WHERE p.user_id = au.id
    AND p.status = 'approved'
    AND NOT (
      COALESCE(p.payment_method, '') = 'alumni_free_access'
      AND COALESCE(p.amount, 0) = 0
    )
  ORDER BY p.created_at DESC
  LIMIT 1
) paid ON true
LEFT JOIN LATERAL (
  SELECT c.*
  FROM public.certificates c
  WHERE c.user_id = au.id
  ORDER BY c.completion_date DESC NULLS LAST
  LIMIT 1
) cert ON true
WHERE public.lms_is_admin_or_master(auth.uid());

COMMENT ON TABLE public.alumni_whitelist IS
  'Fonte histórica dos ex-alunos CTP. A classificação não concede acesso gratuito; o cupom e o pagamento aprovado são obrigatórios.';

COMMENT ON COLUMN public.user_roles.user_origin IS
  'Diferencia alumni/certified_professional de new_student sem conceder gratuidade automática.';

COMMIT;
