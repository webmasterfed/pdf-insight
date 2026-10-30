-- Shared rate-limit counters for the "analyze" Edge Function.
-- In-memory counters do not work on Supabase because requests are spread over many function
-- instances; this table is one counter store that every instance shares.

-- 1. One row per (key, time window). "key" is e.g. "ip:<sha256 of the IP>" or "global".
create table if not exists public.rate_limits (
  key text not null,
  window_start timestamptz not null,
  request_count integer not null,
  primary key (key, window_start)
);

-- 2. Row Level Security ON and no policies: the anon and authenticated roles (the public API
--    keys) can neither read nor write this table. Only service_role, which bypasses RLS, can.
alter table public.rate_limits enable row level security;
revoke all on table public.rate_limits from anon, authenticated;

-- 3. Counts one request and returns how many seconds the caller must wait (0 = allowed).
--    INSERT ... ON CONFLICT DO UPDATE is a single atomic statement, so two instances counting
--    at the same moment can never both read the old value.
create or replace function public.check_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_window_start timestamptz :=
    to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  v_count integer;
begin
  insert into public.rate_limits as r (key, window_start, request_count)
  values (p_key, v_window_start, 1)
  on conflict (key, window_start) do update set request_count = r.request_count + 1
  returning r.request_count into v_count;

  -- Housekeeping: windows older than a day are no longer needed.
  delete from public.rate_limits where window_start < now() - interval '1 day';

  if v_count > p_limit then
    return greatest(
      1,
      ceil(extract(epoch from (v_window_start + make_interval(secs => p_window_seconds) - now())))
    )::integer;
  end if;
  return 0;
end;
$$;

-- 4. Only service_role (used by the Edge Function) may call it; nobody else, including the
--    public anon key, can execute it through the API.
revoke all on function public.check_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, integer, integer) to service_role;
