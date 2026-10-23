-- CTP ANAPP — edição administrativa completa de usuários.
BEGIN;
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
  IF NOT public.lms_is_admin_or_master(p_approved_by) THEN
    RAISE EXCEPTION 'ADMIN_REQUIRED';
  END IF;
  IF v_new_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN
    RAISE EXCEPTION 'INVALID_EMAIL';
  END IF;
  SELECT lower(trim(u.email)) INTO v_old_email FROM auth.users u WHERE u.id = p_target_user_id;
  IF v_old_email IS NULL THEN RAISE EXCEPTION 'USER_NOT_FOUND'; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.alumni_whitelist aw
    WHERE aw.linked_user_id = p_target_user_id OR lower(trim(aw.email)) = v_old_email
  ) THEN RAISE EXCEPTION 'ALUMNI_NOT_FOUND'; END IF;
  IF EXISTS (SELECT 1 FROM auth.users WHERE lower(trim(email)) = v_new_email AND id <> p_target_user_id)
     OR EXISTS (SELECT 1 FROM public.alumni_whitelist WHERE lower(trim(email)) = v_new_email AND COALESCE(linked_user_id, p_target_user_id) <> p_target_user_id)
  THEN RAISE EXCEPTION 'EMAIL_ALREADY_IN_USE'; END IF;
  INSERT INTO public.lms_alumni_email_change_authorizations(target_user_id, old_email, new_email, approved_by, reason, expires_at)
  VALUES (p_target_user_id, v_old_email, v_new_email, p_approved_by,
    COALESCE(NULLIF(trim(p_reason), ''), 'Alteração administrativa individual'), now() + interval '10 minutes')
  RETURNING id INTO v_authorization_id;
  RETURN jsonb_build_object('success', true, 'authorization_id', v_authorization_id, 'expires_in_seconds', 600);
END;
$$;
REVOKE ALL ON FUNCTION public.lms_create_alumni_email_change_authorization(uuid, text, text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lms_create_alumni_email_change_authorization(uuid, text, text, uuid) TO service_role;
COMMIT;
