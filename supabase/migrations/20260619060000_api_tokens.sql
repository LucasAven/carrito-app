-- Voice entry via iOS Shortcuts (see docs/adr/0004-siri-entry-via-shortcut-api.md).
-- A personal bearer token authenticates an anon POST that creates one entry for
-- one Operator. We store only the SHA-256 hash of the raw token, never the token.

create extension if not exists pgcrypto with schema extensions;

create table api_tokens (
  id           uuid primary key default gen_random_uuid(),
  operator_id  uuid not null references operators(id) on delete cascade,
  token_hash   text not null unique,        -- sha256 hex of the raw token
  name         text,                        -- e.g. "iPhone de mamá"
  created_at   timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at   timestamptz
);

alter table api_tokens enable row level security;

-- An Operator can list/revoke their own tokens (for a future settings UI).
create policy "own tokens" on api_tokens
  for all using (auth.uid() = operator_id) with check (auth.uid() = operator_id);

-- Base table privileges for the Data API role; RLS still gates the rows.
grant select, insert, update on public.api_tokens to authenticated;

-- Validate a token and insert one entry for its Operator. SECURITY DEFINER so it
-- bypasses RLS, safe only because it requires a valid, non-revoked token and
-- always derives user_id from that token (never from the caller).
create or replace function create_entry_via_token(
  p_token       text,
  p_kind        entry_kind,
  p_amount      numeric,
  p_label       text,
  p_payment     payment_type,
  p_occurred_on date
) returns entries
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_hash     text := encode(digest(p_token, 'sha256'), 'hex');
  v_operator uuid;
  v_row      entries;
begin
  select operator_id into v_operator
  from api_tokens
  where token_hash = v_hash
    and revoked_at is null;

  if v_operator is null then
    raise exception 'invalid_token' using errcode = '28000';
  end if;

  insert into entries (user_id, kind, label, amount, payment, occurred_on)
  values (v_operator, p_kind, p_label, p_amount, p_payment, p_occurred_on)
  returning * into v_row;

  update api_tokens set last_used_at = now()
  where token_hash = v_hash;

  return v_row;
end;
$$;

revoke all on function create_entry_via_token(
  text, entry_kind, numeric, text, payment_type, date
) from public;

grant execute on function create_entry_via_token(
  text, entry_kind, numeric, text, payment_type, date
) to anon;
