-- CTP ANAPP — configuração segura do ambiente e.Rede de produção.
--
-- As credenciais permanecem exclusivamente nos Supabase Secrets.
-- O checkout continua desabilitado até a autorização financeira de produção
-- ser concluída e validada, evitando cobrança antes da homologação final.

BEGIN;

UPDATE public.system_settings
SET value = 'production', updated_at = NOW()
WHERE key = 'erede_environment';

UPDATE public.system_settings
SET value = '57187312', updated_at = NOW()
WHERE key = 'erede_pv';

UPDATE public.system_settings
SET value = 'false', updated_at = NOW()
WHERE key = 'erede_enabled';

COMMIT;
