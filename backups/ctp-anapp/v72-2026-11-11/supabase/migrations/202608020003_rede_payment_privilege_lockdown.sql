-- Final privilege lockdown for the Rede payment ledger (migration 3).
--
-- RLS limits row access, but table-level privileges such as TRUNCATE,
-- REFERENCES, and TRIGGER must also be removed from browser-facing roles.
-- Students can only read their own rows through the SELECT policy.

revoke all privileges on table public.payments from anon;
revoke all privileges on table public.payments from authenticated;

grant select on table public.payments to authenticated;
grant all privileges on table public.payments to service_role;
