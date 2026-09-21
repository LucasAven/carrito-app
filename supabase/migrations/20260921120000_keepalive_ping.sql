-- Keepalive probe and Shortcut watchdog for the Supabase free-plan pause rule.
--
-- Supabase pauses a free project after 7 days of low activity, and its docs ask
-- for "a few user requests to the database each day". One Shortcut entry per
-- work day sits at or below that line, which is the likeliest reason this
-- project keeps getting paused while it is in daily use.
--
-- Two functions, called by two external cron jobs, because the free cron
-- services can only tell success from failure by HTTP status (none of them
-- assert on the response body):
--
--   keepalive_ping()    hourly, always succeeds. Reads real tables so the call
--                       counts as user activity. A non-2xx means the project
--                       itself is unreachable, which is worth an email.
--   shortcut_watchdog() daily, raises when nothing has been written for a
--                       while. The raise is the alert, since a failed request
--                       is the only thing the cron service can notify on.
--
-- Keeping them apart matters: the watchdog is the one allowed to fail, so a
-- stale-data alert can never interfere with the call that keeps the project up.
--
-- Follows ADR-0007: anon gets execute on SECURITY DEFINER functions and never
-- direct table access.

-- Five days survives a long weekend plus a Monday holiday without crying wolf,
-- and still catches a broken Shortcut inside a week.
create or replace function keepalive_stale_after()
returns interval
language sql
immutable
as $$ select interval '5 days' $$;

create or replace function keepalive_ping()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  -- created_at, not occurred_on: an entry can be backdated (ADR-0003), so
  -- occurred_on would read as stale right after a real write.
  v_last_write    timestamptz;
  v_last_shortcut timestamptz;
begin
  -- Deliberately unindexed scans of both tables. They are small, and touching
  -- the data is the point of the call.
  select max(created_at) into v_last_write from entries;

  select max(last_used_at) into v_last_shortcut
  from api_tokens
  where revoked_at is null;

  return jsonb_build_object(
    'status', case
                when v_last_write is null then 'stale'
                when now() - v_last_write > keepalive_stale_after() then 'stale'
                else 'alive'
              end,
    'hours_since_write',
      round(extract(epoch from (now() - v_last_write)) / 3600)::int,
    'hours_since_shortcut',
      round(extract(epoch from (now() - v_last_shortcut)) / 3600)::int,
    'checked_at', now()
  );
end;
$$;

-- Same read, but it raises when the data is stale so the cron service sees a
-- non-2xx and emails. Returns the same payload on the happy path.
create or replace function shortcut_watchdog()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb := keepalive_ping();
begin
  if v_result ->> 'status' <> 'alive' then
    raise exception 'nothing written in the last % (%)',
      keepalive_stale_after(), v_result
      using errcode = 'P0001';
  end if;

  return v_result;
end;
$$;

revoke all on function keepalive_stale_after() from public;
revoke all on function keepalive_ping() from public;
revoke all on function shortcut_watchdog() from public;

grant execute on function keepalive_ping() to anon;
grant execute on function shortcut_watchdog() to anon;
