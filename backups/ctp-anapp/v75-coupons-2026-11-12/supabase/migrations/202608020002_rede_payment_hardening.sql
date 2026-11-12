-- CTP ANAPP — hardening do fluxo de pagamentos Rede (migração 2)
-- Data: 2026-08-02
-- Objetivos:
--   1. idempotência e rastreabilidade das transações;
--   2. impedir que o cliente altere o próprio pagamento ou acesso;
--   3. manter a Rede desabilitada até a homologação sandbox ser concluída.

BEGIN;

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES public.course_plans(id),
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
  ADD COLUMN IF NOT EXISTS gateway_reference TEXT,
  ADD COLUMN IF NOT EXISTS gateway_environment TEXT,
  ADD COLUMN IF NOT EXISTS failure_code TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS payments_user_idempotency_unique
  ON public.payments (user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS payments_gateway_reference_idx
  ON public.payments (gateway_reference)
  WHERE gateway_reference IS NOT NULL;

CREATE INDEX IF NOT EXISTS payments_gateway_transaction_idx
  ON public.payments (gateway_transaction_id)
  WHERE gateway_transaction_id IS NOT NULL;

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- O cliente pode somente consultar seus pagamentos. Criação e atualização são
-- exclusivas das Edge Functions com service_role.
DROP POLICY IF EXISTS payments_own ON public.payments;
DROP POLICY IF EXISTS users_own_payments ON public.payments;

CREATE POLICY users_own_payments
  ON public.payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

REVOKE INSERT, UPDATE, DELETE ON public.payments FROM authenticated;
GRANT SELECT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;

-- Impede autoatribuição de pagamento, associação, perfil de ex-aluno ou
-- desbloqueio de acesso através da API pública de profiles.
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
    ELSE
      IF NEW.email IS DISTINCT FROM OLD.email
        OR NEW.has_paid IS DISTINCT FROM OLD.has_paid
        OR NEW.is_anapp_member IS DISTINCT FROM OLD.is_anapp_member
        OR NEW.access_blocked IS DISTINCT FROM OLD.access_blocked
        OR NEW.notes IS DISTINCT FROM OLD.notes
        OR NEW.is_alumni IS DISTINCT FROM OLD.is_alumni
        OR NEW.alumni_type IS DISTINCT FROM OLD.alumni_type
        OR NEW.registration_cohort IS DISTINCT FROM OLD.registration_cohort
      THEN
        RAISE EXCEPTION 'Campos administrativos do perfil não podem ser alterados pelo usuário'
          USING ERRCODE = '42501';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_access_fields ON public.profiles;
CREATE TRIGGER trg_protect_profile_access_fields
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_access_fields();

-- A configuração pública contém somente valores não secretos.
UPDATE public.system_settings
SET value = 'false', updated_at = NOW()
WHERE key = 'erede_enabled';

UPDATE public.system_settings
SET value = 'sandbox', updated_at = NOW()
WHERE key = 'erede_environment';

UPDATE public.system_settings
SET value = '57187312', updated_at = NOW()
WHERE key = 'erede_pv';

UPDATE public.system_settings
SET value = '', updated_at = NOW()
WHERE key = 'erede_integration_key';

COMMENT ON COLUMN public.payments.idempotency_key IS
  'Chave única por usuário e tentativa, criada pelo checkout para evitar cobrança duplicada.';
COMMENT ON COLUMN public.payments.gateway_reference IS
  'Referência persistida antes de chamar a Rede e usada na conciliação/webhook.';
COMMENT ON FUNCTION public.protect_profile_access_fields() IS
  'Bloqueia autoatribuição de pagamento e acesso por usuários autenticados comuns.';

COMMIT;
