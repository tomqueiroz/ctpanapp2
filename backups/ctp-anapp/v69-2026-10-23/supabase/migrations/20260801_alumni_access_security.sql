-- CTP ANAPP LMS — acesso permanente de ex-alunos, RBAC e proteção de e-mail
-- Fonte de verdade: public.alumni_whitelist + public.user_roles + public.profiles.
-- Esta migration não cria contas Auth, não importa senhas e não gera pagamentos.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- RBAC
-- ---------------------------------------------------------------------------

ALTER TABLE public.user_roles
  DROP CONSTRAINT IF EXISTS user_roles_role_check;

ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_role_check
  CHECK (role::text = ANY (ARRAY[
    'admin'::varchar,
    'master_admin'::varchar,
    'student'::varchar,
    'instructor'::varchar
  ]::text[]));

CREATE OR REPLACE FUNCTION public.lms_is_admin_or_master(
  check_user_id uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = check_user_id
      AND role IN ('admin', 'master_admin')
      AND COALESCE(access_blocked, false) = false
  );
$$;

CREATE OR REPLACE FUNCTION public.lms_is_master_admin(
  check_user_id uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = check_user_id
      AND role = 'master_admin'
      AND COALESCE(access_blocked, false) = false
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.lms_is_admin_or_master(auth.uid());
$$;

REVOKE ALL ON FUNCTION public.lms_is_admin_or_master(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.lms_is_master_admin(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lms_is_admin_or_master(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.lms_is_master_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

-- Promoção específica e idempotente dos dois responsáveis reconhecidos.
INSERT INTO public.user_roles (
  user_id, role, is_anapp_member, access_blocked, full_name, user_origin, origin_date
)
SELECT
  u.id,
  'master_admin',
  COALESCE(p.is_anapp_member, false),
  false,
  COALESCE(p.full_name, u.raw_user_meta_data->>'full_name'),
  'admin',
  CURRENT_DATE
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.id IN (
  'aaddb58b-50b1-486b-bbcc-83252577aab0'::uuid,
  '3056a958-01c4-448b-bde8-4cdfe5820752'::uuid
)
ON CONFLICT (user_id) DO UPDATE
SET role = 'master_admin',
    access_blocked = false,
    user_origin = 'admin';

CREATE UNIQUE INDEX IF NOT EXISTS master_admins_user_id_unique
  ON public.master_admins (user_id)
  WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS master_admins_email_normalized_unique
  ON public.master_admins (lower(trim(email)));

INSERT INTO public.master_admins (user_id, email, full_name, active)
SELECT
  u.id,
  lower(trim(u.email)),
  COALESCE(p.full_name, u.raw_user_meta_data->>'full_name', 'Master Admin'),
  true
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.id IN (
  'aaddb58b-50b1-486b-bbcc-83252577aab0'::uuid,
  '3056a958-01c4-448b-bde8-4cdfe5820752'::uuid
)
ON CONFLICT (user_id) WHERE user_id IS NOT NULL
DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  active = true;

-- ---------------------------------------------------------------------------
-- Auditoria e autorização de troca individual de e-mail
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.lms_admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  target_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lms_admin_audit_log_created_idx
  ON public.lms_admin_audit_log (created_at DESC);

CREATE INDEX IF NOT EXISTS lms_admin_audit_log_target_idx
  ON public.lms_admin_audit_log (target_user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.lms_alumni_email_change_authorizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  old_email text NOT NULL,
  new_email text NOT NULL,
  approved_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  reason text NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lms_alumni_email_old_normalized
    CHECK (old_email = lower(trim(old_email))),
  CONSTRAINT lms_alumni_email_new_normalized
    CHECK (new_email = lower(trim(new_email))),
  CONSTRAINT lms_alumni_email_distinct
    CHECK (old_email <> new_email)
);

CREATE INDEX IF NOT EXISTS lms_alumni_email_authorization_lookup_idx
  ON public.lms_alumni_email_change_authorizations
  (target_user_id, new_email, expires_at)
  WHERE used_at IS NULL;

ALTER TABLE public.lms_admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_alumni_email_change_authorizations ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.lms_admin_audit_log FROM anon, authenticated;
REVOKE ALL ON public.lms_alumni_email_change_authorizations FROM anon, authenticated;
GRANT SELECT ON public.lms_admin_audit_log TO authenticated;
GRANT ALL ON public.lms_admin_audit_log TO service_role;
GRANT ALL ON public.lms_alumni_email_change_authorizations TO service_role;

DROP POLICY IF EXISTS lms_admin_audit_read ON public.lms_admin_audit_log;
CREATE POLICY lms_admin_audit_read
  ON public.lms_admin_audit_log
  FOR SELECT
  TO authenticated
  USING (public.lms_is_admin_or_master(auth.uid()));

DROP POLICY IF EXISTS lms_admin_audit_service ON public.lms_admin_audit_log;
CREATE POLICY lms_admin_audit_service
  ON public.lms_admin_audit_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS lms_alumni_email_authorization_service
  ON public.lms_alumni_email_change_authorizations;
CREATE POLICY lms_alumni_email_authorization_service
  ON public.lms_alumni_email_change_authorizations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.lms_create_alumni_email_change_authorization(
  p_target_user_id uuid,
  p_new_email text,
  p_reason text,
  p_approved_by uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_old_email text;
  v_new_email text := lower(trim(p_new_email));
  v_authorization_id uuid;
BEGIN
  IF NOT public.lms_is_master_admin(p_approved_by) THEN
    RAISE EXCEPTION 'MASTER_ADMIN_REQUIRED';
  END IF;

  IF v_new_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN
    RAISE EXCEPTION 'INVALID_EMAIL';
  END IF;

  SELECT lower(trim(u.email))
  INTO v_old_email
  FROM auth.users u
  WHERE u.id = p_target_user_id;

  IF v_old_email IS NULL THEN
    RAISE EXCEPTION 'USER_NOT_FOUND';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.alumni_whitelist aw
    WHERE aw.linked_user_id = p_target_user_id
       OR lower(trim(aw.email)) = v_old_email
  ) THEN
    RAISE EXCEPTION 'ALUMNI_NOT_FOUND';
  END IF;

  IF EXISTS (
    SELECT 1 FROM auth.users
    WHERE lower(trim(email)) = v_new_email
      AND id <> p_target_user_id
  ) OR EXISTS (
    SELECT 1 FROM public.alumni_whitelist
    WHERE lower(trim(email)) = v_new_email
      AND COALESCE(linked_user_id, p_target_user_id) <> p_target_user_id
  ) THEN
    RAISE EXCEPTION 'EMAIL_ALREADY_IN_USE';
  END IF;

  INSERT INTO public.lms_alumni_email_change_authorizations (
    target_user_id,
    old_email,
    new_email,
    approved_by,
    reason,
    expires_at
  )
  VALUES (
    p_target_user_id,
    v_old_email,
    v_new_email,
    p_approved_by,
    COALESCE(NULLIF(trim(p_reason), ''), 'Alteração administrativa individual'),
    now() + interval '10 minutes'
  )
  RETURNING id INTO v_authorization_id;

  RETURN jsonb_build_object(
    'success', true,
    'authorization_id', v_authorization_id,
    'expires_in_seconds', 600
  );
END;
$$;

REVOKE ALL ON FUNCTION public.lms_create_alumni_email_change_authorization(
  uuid, text, text, uuid
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lms_create_alumni_email_change_authorization(
  uuid, text, text, uuid
) TO service_role;

-- ---------------------------------------------------------------------------
-- Fonte de verdade dos ex-alunos e privilégios mínimos
-- ---------------------------------------------------------------------------

CREATE UNIQUE INDEX IF NOT EXISTS alumni_whitelist_email_normalized_unique
  ON public.alumni_whitelist (lower(trim(email)));

ALTER TABLE public.alumni_whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.alumni_whitelist FROM anon, authenticated;
REVOKE ALL ON public.user_roles FROM anon, authenticated;
GRANT SELECT ON public.alumni_whitelist TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.alumni_whitelist TO service_role;
GRANT ALL ON public.user_roles TO service_role;

DROP POLICY IF EXISTS alumni_admin_full ON public.alumni_whitelist;
DROP POLICY IF EXISTS alumni_self_read ON public.alumni_whitelist;
DROP POLICY IF EXISTS alumni_admin_read ON public.alumni_whitelist;
DROP POLICY IF EXISTS alumni_service_all ON public.alumni_whitelist;

CREATE POLICY alumni_self_read
  ON public.alumni_whitelist
  FOR SELECT
  TO authenticated
  USING (
    linked_user_id = auth.uid()
    OR lower(trim(email)) = lower(trim(COALESCE(auth.jwt()->>'email', '')))
  );

CREATE POLICY alumni_admin_read
  ON public.alumni_whitelist
  FOR SELECT
  TO authenticated
  USING (public.lms_is_admin_or_master(auth.uid()));

CREATE POLICY alumni_service_all
  ON public.alumni_whitelist
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can view all users" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS user_roles_select_own ON public.user_roles;
DROP POLICY IF EXISTS user_roles_service_role_all ON public.user_roles;
DROP POLICY IF EXISTS user_roles_read ON public.user_roles;
DROP POLICY IF EXISTS user_roles_service_all ON public.user_roles;

CREATE POLICY user_roles_read
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.lms_is_admin_or_master(auth.uid())
  );

CREATE POLICY user_roles_service_all
  ON public.user_roles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- Concessão de acesso sem simular pagamento
-- ---------------------------------------------------------------------------

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
    is_alumni, alumni_type, registration_cohort
  )
  VALUES (
    p_user_id,
    v_auth_email,
    v_alumni.full_name,
    false,
    v_is_certified,
    true,
    v_alumni.alumni_type,
    'pre_2026'
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
      is_anapp_member = public.profiles.is_anapp_member OR EXCLUDED.is_anapp_member,
      is_alumni = true,
      alumni_type = EXCLUDED.alumni_type,
      registration_cohort = 'pre_2026',
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
    'access_granted_without_payment', true
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_import_alumni(
  p_email text,
  p_full_name text DEFAULT NULL,
  p_cpf text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_alumni_type text DEFAULT 'alumni',
  p_cert_number text DEFAULT NULL,
  p_year integer DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_email text := lower(trim(p_email));
  v_type text := COALESCE(NULLIF(trim(p_alumni_type), ''), 'alumni');
  v_user_id uuid;
  v_id uuid;
  v_inserted boolean;
BEGIN
  IF v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN
    RAISE EXCEPTION 'INVALID_EMAIL';
  END IF;

  IF v_type NOT IN ('alumni', 'certified_professional', 'alumni_certified') THEN
    RAISE EXCEPTION 'INVALID_ALUMNI_TYPE';
  END IF;

  SELECT id INTO v_user_id
  FROM auth.users
  WHERE lower(trim(email)) = v_email
  LIMIT 1;

  INSERT INTO public.alumni_whitelist (
    email, full_name, cpf, phone, alumni_type,
    certificate_number, completion_year, imported_by,
    linked_user_id, linked_at
  )
  VALUES (
    v_email, NULLIF(trim(p_full_name), ''), NULLIF(trim(p_cpf), ''),
    NULLIF(trim(p_phone), ''), v_type, NULLIF(trim(p_cert_number), ''),
    p_year, 'csv_reconciliation_2026_08_01',
    v_user_id, CASE WHEN v_user_id IS NULL THEN NULL ELSE now() END
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO v_id;

  v_inserted := v_id IS NOT NULL;

  IF NOT v_inserted THEN
    SELECT id INTO v_id
    FROM public.alumni_whitelist
    WHERE lower(trim(email)) = v_email;
  END IF;

  IF v_user_id IS NOT NULL THEN
    PERFORM public.check_alumni_and_grant_access(v_user_id, v_email);
  END IF;

  RETURN jsonb_build_object(
    'action', CASE WHEN v_inserted THEN 'inserted' ELSE 'skipped' END,
    'id', v_id,
    'user_linked', v_user_id IS NOT NULL
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_alumni_email(
  p_alumni_id uuid,
  p_new_email text,
  p_reason text DEFAULT 'Atualização administrativa'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN jsonb_build_object(
    'success', false,
    'error', 'USE_MASTER_ADMIN_EDGE_FUNCTION',
    'message', 'A alteração deve sincronizar Supabase Auth, whitelist e perfil.'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_import_alumni(
  text, text, text, text, text, text, integer
) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_update_alumni_email(
  uuid, text, text
) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.check_alumni_and_grant_access(
  uuid, text
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_import_alumni(
  text, text, text, text, text, text, integer
) TO service_role;
GRANT EXECUTE ON FUNCTION public.check_alumni_and_grant_access(
  uuid, text
) TO service_role;

-- ---------------------------------------------------------------------------
-- E-mail imutável para ex-alunos (Auth, whitelist e perfil)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.protect_alumni_email_fn()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.email IS DISTINCT FROM NEW.email
     AND NOT EXISTS (
       SELECT 1
       FROM public.lms_alumni_email_change_authorizations a
       WHERE a.target_user_id = OLD.linked_user_id
         AND a.old_email = lower(trim(OLD.email))
         AND a.new_email = lower(trim(NEW.email))
         AND a.used_at IS NOT NULL
         AND a.synced_at IS NULL
         AND a.expires_at > now()
     ) THEN
    RAISE EXCEPTION 'ALUMNI_EMAIL_LOCKED';
  END IF;
  NEW.email := lower(trim(NEW.email));
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.lms_protect_alumni_profile_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.email IS DISTINCT FROM NEW.email
     AND COALESCE(OLD.is_alumni, false)
     AND NOT EXISTS (
       SELECT 1
       FROM public.lms_alumni_email_change_authorizations a
       WHERE a.target_user_id = OLD.id
         AND a.old_email = lower(trim(OLD.email))
         AND a.new_email = lower(trim(NEW.email))
         AND a.used_at IS NOT NULL
         AND a.synced_at IS NULL
         AND a.expires_at > now()
     ) THEN
    RAISE EXCEPTION 'ALUMNI_EMAIL_LOCKED';
  END IF;
  NEW.email := lower(trim(NEW.email));
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.lms_guard_alumni_auth_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_authorization_id uuid;
BEGIN
  IF OLD.email IS NOT DISTINCT FROM NEW.email THEN
    RETURN NEW;
  END IF;

  NEW.email := lower(trim(NEW.email));

  IF NOT EXISTS (
    SELECT 1
    FROM public.alumni_whitelist aw
    WHERE aw.linked_user_id = OLD.id
       OR lower(trim(aw.email)) = lower(trim(OLD.email))
  ) THEN
    RETURN NEW;
  END IF;

  SELECT id
  INTO v_authorization_id
  FROM public.lms_alumni_email_change_authorizations
  WHERE target_user_id = OLD.id
    AND old_email = lower(trim(OLD.email))
    AND new_email = NEW.email
    AND used_at IS NULL
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1
  FOR UPDATE;

  IF v_authorization_id IS NULL THEN
    RAISE EXCEPTION 'ALUMNI_EMAIL_LOCKED';
  END IF;

  UPDATE public.lms_alumni_email_change_authorizations
  SET used_at = now()
  WHERE id = v_authorization_id;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.lms_sync_alumni_email_after_auth()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_authorization public.lms_alumni_email_change_authorizations%ROWTYPE;
BEGIN
  IF OLD.email IS NOT DISTINCT FROM NEW.email THEN
    RETURN NEW;
  END IF;

  SELECT *
  INTO v_authorization
  FROM public.lms_alumni_email_change_authorizations
  WHERE target_user_id = NEW.id
    AND old_email = lower(trim(OLD.email))
    AND new_email = lower(trim(NEW.email))
    AND used_at IS NOT NULL
    AND synced_at IS NULL
    AND expires_at > now()
  ORDER BY used_at DESC
  LIMIT 1
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  UPDATE public.alumni_whitelist
  SET email = v_authorization.new_email
  WHERE linked_user_id = NEW.id
     OR lower(trim(email)) = v_authorization.old_email;

  UPDATE public.profiles
  SET email = v_authorization.new_email,
      updated_at = now()
  WHERE id = NEW.id;

  INSERT INTO public.lms_admin_audit_log (
    actor_user_id, target_user_id, action, details
  )
  VALUES (
    v_authorization.approved_by,
    NEW.id,
    'change_alumni_email',
    jsonb_build_object(
      'old_email_hash', encode(extensions.digest(v_authorization.old_email, 'sha256'), 'hex'),
      'new_email_hash', encode(extensions.digest(v_authorization.new_email, 'sha256'), 'hex'),
      'reason', v_authorization.reason
    )
  );

  UPDATE public.lms_alumni_email_change_authorizations
  SET synced_at = now()
  WHERE id = v_authorization.id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_alumni_email ON public.alumni_whitelist;
CREATE TRIGGER trg_protect_alumni_email
  BEFORE UPDATE OF email ON public.alumni_whitelist
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_alumni_email_fn();

DROP TRIGGER IF EXISTS trg_protect_alumni_profile_email ON public.profiles;
CREATE TRIGGER trg_protect_alumni_profile_email
  BEFORE UPDATE OF email ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.lms_protect_alumni_profile_email();

DROP TRIGGER IF EXISTS trg_guard_alumni_auth_email ON auth.users;
CREATE TRIGGER trg_guard_alumni_auth_email
  BEFORE UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.lms_guard_alumni_auth_email();

DROP TRIGGER IF EXISTS trg_sync_alumni_auth_email ON auth.users;
CREATE TRIGGER trg_sync_alumni_auth_email
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.lms_sync_alumni_email_after_auth();

-- ---------------------------------------------------------------------------
-- Cadastro e classificação por coorte
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_cohort text := CASE
    WHEN NEW.created_at >= timestamptz '2026-08-03 00:00:00+00'
      THEN 'new_2026'
    ELSE 'pre_2026'
  END;
BEGIN
  INSERT INTO public.profiles (
    id, full_name, email, is_alumni, registration_cohort
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    lower(trim(NEW.email)),
    false,
    v_cohort
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
      registration_cohort = COALESCE(public.profiles.registration_cohort, EXCLUDED.registration_cohort),
      updated_at = now();

  INSERT INTO public.user_roles (
    user_id, role, full_name, user_origin, origin_date
  )
  VALUES (
    NEW.id,
    'student',
    NEW.raw_user_meta_data->>'full_name',
    'new_student',
    NEW.created_at::date
  )
  ON CONFLICT (user_id) DO NOTHING;

  PERFORM public.check_alumni_and_grant_access(NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

-- Corrige a classificação dos usuários já cadastrados sem alterar admins.
UPDATE public.profiles p
SET registration_cohort = CASE
  WHEN u.created_at >= timestamptz '2026-08-03 00:00:00+00' THEN 'new_2026'
  ELSE COALESCE(p.registration_cohort, 'pre_2026')
END
FROM auth.users u
WHERE u.id = p.id
  AND COALESCE(p.is_alumni, false) = false;

UPDATE public.user_roles ur
SET user_origin = 'new_student',
    origin_date = COALESCE(ur.origin_date, u.created_at::date)
FROM auth.users u
WHERE u.id = ur.user_id
  AND ur.role NOT IN ('admin', 'master_admin')
  AND ur.alumni_whitelist_id IS NULL;

-- ---------------------------------------------------------------------------
-- Visão administrativa segura e sem pagamentos fictícios
-- ---------------------------------------------------------------------------

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
  COALESCE(pr.is_alumni, false) AS access_granted_without_payment,
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

REVOKE ALL ON public.admin_users_view FROM anon;
GRANT SELECT ON public.admin_users_view TO authenticated, service_role;

COMMENT ON TABLE public.alumni_whitelist IS
  'Fonte permanente dos ex-alunos CTP. O e-mail legado ativa acesso gratuito sem gerar pagamento.';

COMMENT ON COLUMN public.user_roles.user_origin IS
  'Diferencia alumni/certified_professional de new_student. Novos cadastros a partir de 03/08/2026 permanecem new_student.';
