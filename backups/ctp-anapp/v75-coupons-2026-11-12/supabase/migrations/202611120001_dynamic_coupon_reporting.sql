-- Separate commercial attribution from the immutable payment evidence.
BEGIN;

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS attributed_coupon_id uuid REFERENCES public.payment_coupons(id),
  ADD COLUMN IF NOT EXISTS attributed_coupon_code text;

CREATE INDEX IF NOT EXISTS payments_attributed_coupon_idx
  ON public.payments(attributed_coupon_id);

CREATE TABLE IF NOT EXISTS public.coupon_attribution_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid,
  execution_source text NOT NULL DEFAULT 'admin_edge_function',
  entity_type text NOT NULL CHECK (entity_type IN ('payment', 'profile')),
  entity_id uuid NOT NULL,
  original_coupon_code text,
  previous_attributed_code text,
  attributed_coupon_id uuid NOT NULL REFERENCES public.payment_coupons(id),
  attributed_coupon_code text NOT NULL,
  window_start timestamptz NOT NULL,
  window_end timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(entity_type, entity_id, attributed_coupon_id, window_start, window_end)
);
ALTER TABLE public.coupon_attribution_audit ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.coupon_attribution_audit FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.coupon_attribution_audit TO service_role;
CREATE POLICY coupon_attribution_service ON public.coupon_attribution_audit
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Guard existing coupon identities as well as original financial evidence.
CREATE OR REPLACE FUNCTION public.protect_used_coupon_code()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'DELETE' OR NEW.code IS DISTINCT FROM OLD.code THEN
    IF EXISTS (
      SELECT 1 FROM public.payments p
      WHERE p.coupon_id = OLD.id OR p.coupon_code = OLD.code
        OR p.attributed_coupon_id = OLD.id OR p.attributed_coupon_code = OLD.code
    ) OR EXISTS (
      SELECT 1 FROM public.coupon_attribution_audit a WHERE a.attributed_coupon_id = OLD.id
    ) THEN
      RAISE EXCEPTION 'Cupom com histórico deve manter seu código e ser desativado, não excluído';
    END IF;
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER protect_used_coupon_code
  BEFORE UPDATE OF code OR DELETE ON public.payment_coupons
  FOR EACH ROW EXECUTE FUNCTION public.protect_used_coupon_code();

-- New alumni registrations use the latest active, currently valid campaign.
CREATE OR REPLACE FUNCTION public.assign_current_alumni_coupon()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.is_alumni AND NOT COALESCE(NEW.has_paid, false) THEN
    NEW.registration_coupon_code := (
      SELECT code FROM (
        SELECT code, is_active, starts_at, ends_at FROM public.payment_coupons
        ORDER BY created_at DESC, id DESC LIMIT 1
      ) latest
      WHERE is_active AND starts_at <= now() AND ends_at > now()
    );
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER zz_assign_current_alumni_coupon
  BEFORE INSERT OR UPDATE OF registration_coupon_code ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.assign_current_alumni_coupon();

-- Called by the authenticated admin Edge Function using its server-side service role.
-- Preview and apply use exactly the same half-open, fixed 48-hour window.
CREATE OR REPLACE FUNCTION public.admin_reassign_recent_coupons(
  p_actor uuid, p_target uuid, p_window_end timestamptz, p_apply boolean DEFAULT false
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE
  v_target public.payment_coupons%ROWTYPE;
  v_latest uuid;
  v_start timestamptz;
  v_payments integer;
  v_profiles integer;
BEGIN
  IF NOT p_apply AND p_window_end IS NULL THEN p_window_end := now(); END IF;
  v_start := p_window_end - interval '48 hours';
  IF NOT (
    p_actor IS NULL AND auth.role() IS NULL
      AND session_user IN ('postgres', 'supabase_admin')
  ) AND NOT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = p_actor AND role IN ('admin', 'master_admin')
      AND NOT COALESCE(access_blocked, false)
  ) THEN RAISE EXCEPTION 'ADMIN_REQUIRED'; END IF;
  IF p_window_end IS NULL OR p_window_end > now()
    OR p_window_end < now() - interval '30 minutes' THEN
    RAISE EXCEPTION 'Prévia expirada; gere novamente';
  END IF;

  -- Serialize coupon creation/update with reconciliation and reject a stale target.
  LOCK TABLE public.payment_coupons IN SHARE MODE;
  SELECT id INTO v_latest FROM public.payment_coupons
    ORDER BY created_at DESC, id DESC LIMIT 1;
  SELECT * INTO v_target FROM public.payment_coupons WHERE id = p_target;
  IF v_latest IS DISTINCT FROM p_target OR v_target.id IS NULL THEN
    RAISE EXCEPTION 'O cupom mais recente mudou; gere uma nova prévia';
  END IF;
  IF NOT v_target.is_active OR v_target.starts_at > now() OR v_target.ends_at <= now() THEN
    RAISE EXCEPTION 'O cupom mais recente precisa estar ativo e dentro da vigência';
  END IF;

  CREATE TEMP TABLE recent_coupon_payments ON COMMIT DROP AS
    SELECT p.id, p.coupon_code, p.attributed_coupon_code
    FROM public.payments p
    WHERE p.created_at >= v_start AND p.created_at < p_window_end
      AND (p.coupon_id IS NOT NULL OR NULLIF(trim(p.coupon_code), '') IS NOT NULL
        OR p.attributed_coupon_id IS NOT NULL)
      AND (p.attributed_coupon_id IS DISTINCT FROM v_target.id
        OR p.attributed_coupon_code IS DISTINCT FROM v_target.code);
  CREATE TEMP TABLE recent_coupon_profiles ON COMMIT DROP AS
    SELECT p.id, p.registration_coupon_code
    FROM public.profiles p
    WHERE p.created_at >= v_start AND p.created_at < p_window_end
      AND NULLIF(trim(p.registration_coupon_code), '') IS NOT NULL
      AND p.registration_coupon_code IS DISTINCT FROM v_target.code
      AND NOT EXISTS (
        SELECT 1 FROM public.payments pay WHERE pay.user_id = p.id AND pay.status = 'approved'
      );
  SELECT count(*) INTO v_payments FROM recent_coupon_payments;
  SELECT count(*) INTO v_profiles FROM recent_coupon_profiles;

  IF p_apply THEN
    INSERT INTO public.coupon_attribution_audit (
      actor_user_id, execution_source, entity_type, entity_id, original_coupon_code, previous_attributed_code,
      attributed_coupon_id, attributed_coupon_code, window_start, window_end
    )
    SELECT p_actor, CASE WHEN p_actor IS NULL THEN 'supabase_sql_editor' ELSE 'admin_edge_function' END,
      'payment', id, coupon_code, attributed_coupon_code,
      v_target.id, v_target.code, v_start, p_window_end FROM recent_coupon_payments
    UNION ALL
    SELECT p_actor, CASE WHEN p_actor IS NULL THEN 'supabase_sql_editor' ELSE 'admin_edge_function' END,
      'profile', id, registration_coupon_code, registration_coupon_code,
      v_target.id, v_target.code, v_start, p_window_end FROM recent_coupon_profiles;
    UPDATE public.payments p
      SET attributed_coupon_id = v_target.id, attributed_coupon_code = v_target.code
      FROM recent_coupon_payments r WHERE p.id = r.id;
    UPDATE public.profiles p
      SET registration_coupon_code = v_target.code, updated_at = now()
      FROM recent_coupon_profiles r WHERE p.id = r.id;
    INSERT INTO public.lms_admin_audit_log(actor_user_id, action, details)
    VALUES (p_actor, 'coupon_reconciliation_48h', jsonb_build_object(
      'target_coupon_id', v_target.id, 'target_coupon_code', v_target.code,
      'window_start', v_start, 'window_end', p_window_end,
      'execution_source', CASE WHEN p_actor IS NULL THEN 'supabase_sql_editor' ELSE 'admin_edge_function' END,
      'payments', v_payments, 'pending_registrations', v_profiles));
  END IF;
  RETURN jsonb_build_object(
    'success', true, 'applied', p_apply, 'target_id', v_target.id,
    'target_code', v_target.code, 'window_start', v_start, 'window_end', p_window_end,
    'payments', v_payments, 'pending_registrations', v_profiles);
END;
$$;
REVOKE ALL ON FUNCTION public.admin_reassign_recent_coupons(uuid, uuid, timestamptz, boolean)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_reassign_recent_coupons(uuid, uuid, timestamptz, boolean)
  TO service_role;

COMMIT;
