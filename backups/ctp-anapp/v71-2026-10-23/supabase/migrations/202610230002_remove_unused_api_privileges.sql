-- Least-privilege correction, inspected against the live schema on 2026-10-23.
-- Retain authenticated SELECT on both views: Admin.tsx consumes admin_users_view.
-- Its existing admin predicate/security barrier MUST remain in place.
-- No table contents, RLS policies, authentication, or historical scores change.
BEGIN;
SET LOCAL lock_timeout = '5s';
DO $guard$
BEGIN
  IF position('lms_is_admin_or_master(auth.uid())' IN
    pg_get_viewdef('public.admin_users_view'::regclass, true)) = 0 THEN
    RAISE EXCEPTION 'Unexpected admin view definition; review before applying.';
  END IF;
END $guard$;

REVOKE ALL PRIVILEGES ON public.admin_users_view FROM PUBLIC, anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON public.admin_users_view FROM authenticated;
REVOKE ALL PRIVILEGES ON public.security_dashboard FROM PUBLIC, anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON public.security_dashboard FROM authenticated;
REVOKE ALL PRIVILEGES ON public.exam_questions FROM PUBLIC, anon, authenticated;

DO $verify$
BEGIN
  IF NOT has_table_privilege('authenticated', 'public.admin_users_view', 'SELECT')
     OR NOT has_table_privilege('authenticated', 'public.security_dashboard', 'SELECT')
     OR has_table_privilege('anon', 'public.security_dashboard', 'SELECT')
     OR has_table_privilege('authenticated', 'public.exam_questions', 'TRUNCATE')
     OR has_table_privilege('anon', 'public.exam_questions', 'TRUNCATE')
     OR has_table_privilege('authenticated', 'public.exam_questions', 'SELECT') THEN
    RAISE EXCEPTION 'Privilege postcondition failed; rolling back.';
  END IF;
END $verify$;
COMMIT;

-- Does not claim to remove the intentional security-definer-view alerts.
-- Future work: admin-only RPCs instead of direct view access, after tracing all
-- consumers. Never grant users direct SELECT on auth.users as a workaround.
