-- Role audit cleanup (migration 4).
BEGIN;

ALTER TABLE public.role_changes_audit
  DROP CONSTRAINT IF EXISTS role_changes_audit_user_id_fkey;

ALTER TABLE public.role_changes_audit
  ADD CONSTRAINT role_changes_audit_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE SET NULL;

ALTER TABLE public.role_changes_audit
  DROP CONSTRAINT IF EXISTS role_changes_audit_changed_by_fkey;

ALTER TABLE public.role_changes_audit
  ADD CONSTRAINT role_changes_audit_changed_by_fkey
  FOREIGN KEY (changed_by)
  REFERENCES auth.users(id)
  ON DELETE SET NULL;

COMMIT;
