-- CTP ANAPP — desativação das superfícies legadas da Rede (migração 1)
-- As funções legadas são removidas pelo deploy administrativo do Supabase.

BEGIN;

DO $$
BEGIN
  IF to_regclass('public.payment_settings') IS NOT NULL THEN
    UPDATE public.payment_settings
    SET
      api_token = '',
      is_active = FALSE,
      updated_at = NOW()
    WHERE gateway_name = 'rede';

    REVOKE ALL ON public.payment_settings FROM anon, authenticated;
    GRANT ALL ON public.payment_settings TO service_role;
  END IF;
END;
$$;

COMMIT;
