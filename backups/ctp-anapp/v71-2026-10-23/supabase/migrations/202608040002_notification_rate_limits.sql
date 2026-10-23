-- CTP ANAPP LMS — rate limit server-side para notificações públicas.

CREATE TABLE IF NOT EXISTS public.notification_rate_limits (
  rate_key text PRIMARY KEY,
  window_started_at timestamptz NOT NULL DEFAULT now(),
  request_count integer NOT NULL DEFAULT 1 CHECK (request_count > 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_rate_limits ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.notification_rate_limits FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.notification_rate_limits TO service_role;

CREATE OR REPLACE FUNCTION public.consume_notification_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  IF p_key IS NULL
     OR length(p_key) < 16
     OR p_limit < 1
     OR p_window_seconds < 60 THEN
    RAISE EXCEPTION 'INVALID_RATE_LIMIT_INPUT';
  END IF;

  INSERT INTO public.notification_rate_limits (
    rate_key,
    window_started_at,
    request_count,
    updated_at
  )
  VALUES (p_key, now(), 1, now())
  ON CONFLICT (rate_key) DO UPDATE
  SET window_started_at = CASE
        WHEN public.notification_rate_limits.window_started_at
             <= now() - make_interval(secs => p_window_seconds)
          THEN now()
        ELSE public.notification_rate_limits.window_started_at
      END,
      request_count = CASE
        WHEN public.notification_rate_limits.window_started_at
             <= now() - make_interval(secs => p_window_seconds)
          THEN 1
        ELSE public.notification_rate_limits.request_count + 1
      END,
      updated_at = now()
  RETURNING request_count INTO v_count;

  RETURN v_count <= p_limit;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_notification_rate_limit(text, integer, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_notification_rate_limit(text, integer, integer)
  TO service_role;

