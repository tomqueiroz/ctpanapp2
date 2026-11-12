-- CTP ANAPP LMS — backup lógico diário via Supabase Cron + Vault + pg_net.

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM vault.secrets
    WHERE name = 'ctp_anapp_daily_backup_cron'
  ) THEN
    PERFORM vault.create_secret(
      replace(gen_random_uuid()::text, '-', '')
        || replace(gen_random_uuid()::text, '-', ''),
      'ctp_anapp_daily_backup_cron',
      'Token interno do pg_cron para acionar o backup lógico diário do CTP ANAPP'
    );
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_daily_backup_cron_secret(
  p_secret text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, vault
AS $$
  SELECT COALESCE(
    extensions.digest(COALESCE(p_secret, ''), 'sha256')
      = extensions.digest(decrypted_secret, 'sha256'),
    false
  )
  FROM vault.decrypted_secrets
  WHERE name = 'ctp_anapp_daily_backup_cron'
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.validate_daily_backup_cron_secret(text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validate_daily_backup_cron_secret(text)
  TO service_role;

CREATE OR REPLACE FUNCTION public.invoke_ctp_daily_backup()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault, extensions
AS $$
DECLARE
  v_secret text;
  v_request_id bigint;
BEGIN
  SELECT decrypted_secret
  INTO v_secret
  FROM vault.decrypted_secrets
  WHERE name = 'ctp_anapp_daily_backup_cron'
  LIMIT 1;

  IF v_secret IS NULL THEN
    RAISE EXCEPTION 'BACKUP_CRON_SECRET_NOT_FOUND';
  END IF;

  SELECT net.http_post(
    url := 'https://egihufoowzfykieozusr.supabase.co/functions/v1/daily_backup_and_notify',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-CTP-Cron-Secret', v_secret
    ),
    body := jsonb_build_object(
      'source', 'supabase_cron',
      'requested_at', now()
    ),
    timeout_milliseconds := 120000
  )
  INTO v_request_id;

  RETURN v_request_id;
END;
$$;

REVOKE ALL ON FUNCTION public.invoke_ctp_daily_backup()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.invoke_ctp_daily_backup()
  TO service_role;

DO $$
DECLARE
  v_job_id bigint;
BEGIN
  FOR v_job_id IN
    SELECT jobid
    FROM cron.job
    WHERE jobname = 'ctp-anapp-daily-logical-backup'
  LOOP
    PERFORM cron.unschedule(v_job_id);
  END LOOP;
END;
$$;

SELECT cron.schedule(
  'ctp-anapp-daily-logical-backup',
  '0 6 * * *',
  $cron$SELECT public.invoke_ctp_daily_backup();$cron$
);

CREATE OR REPLACE FUNCTION public.ctp_backup_schedule_status()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, cron
AS $$
  SELECT jsonb_build_object(
    'configured', COUNT(*) = 1,
    'job_count', COUNT(*),
    'schedule', MIN(schedule),
    'active', bool_and(active)
  )
  FROM cron.job
  WHERE jobname = 'ctp-anapp-daily-logical-backup';
$$;

REVOKE ALL ON FUNCTION public.ctp_backup_schedule_status()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ctp_backup_schedule_status()
  TO service_role;
