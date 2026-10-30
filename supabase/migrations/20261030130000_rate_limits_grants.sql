-- The first migration enabled RLS and revoked the public roles, but never granted the table to
-- service_role. New tables on this project get no automatic grants, so check_rate_limit()
-- (security invoker, called as service_role) failed with "permission denied for table".
-- Grants exactly the operations the function performs, to service_role only.
grant select, insert, update, delete on table public.rate_limits to service_role;
