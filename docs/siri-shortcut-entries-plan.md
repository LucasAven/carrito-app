# Plan: create entries by voice via iOS Shortcuts

Goal: let the Operator (mom) say "Hey Siri, nueva venta" (and "nuevo gasto") and have an Entry created hands-free, without opening the app. Decision and rationale live in [ADR-0004](./adr/0004-siri-entry-via-shortcut-api.md). This document is the build plan.

## Why a Shortcut (not native Siri)

A PWA cannot register Siri commands; WebKit exposes no App Intents API to web content. The supported voice path on iOS is the **Shortcuts** app: a Shortcut named "Nueva venta" is invoked by voice, asks for the amount (and optionally a concept), and makes an authenticated `POST` to our backend. See ADR-0004 for the alternatives we rejected.

## Architecture overview

```
"Hey Siri, nueva venta"
        |
   iOS Shortcut  (asks amount + concept by voice)
        |  POST /api/shortcut/entries
        |  Authorization: Bearer <personal token>
        v
  Next Route Handler  (anon Supabase client, no cookies)
        |  supabase.rpc("create_entry_via_token", {...})
        v
  Postgres SECURITY DEFINER function
        - hash(token) -> api_tokens -> operator_id
        - insert into entries (user_id = operator_id)
        - return the new row
```

The Next runtime never gets a `service_role` key. The only privileged code is one Postgres function whose sole job is "validate token, insert one entry for that Operator".

## 1. Data model: `api_tokens`

New migration under `supabase/migrations/`:

```sql
create table api_tokens (
  id          uuid primary key default gen_random_uuid(),
  operator_id uuid not null references operators(id) on delete cascade,
  token_hash  text not null unique,        -- sha256 hex of the raw token
  name        text,                         -- e.g. "iPhone de mamá"
  created_at  timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at  timestamptz
);

alter table api_tokens enable row level security;

-- An Operator can list/revoke their own tokens (for a future settings UI).
create policy "own tokens" on api_tokens
  for all using (auth.uid() = operator_id) with check (auth.uid() = operator_id);
```

The raw token is never stored. We keep only its SHA-256 hash. `revoked_at` follows the existing soft-delete convention.

## 2. Token validation + insert: `security definer` RPC

Reuses `pgcrypto` (available on Supabase) for hashing. One function, granted to `anon`, that is safe only because it requires a valid token:

```sql
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
set search_path = public
as $$
declare
  v_operator uuid;
  v_row entries;
begin
  select operator_id into v_operator
  from api_tokens
  where token_hash = encode(digest(p_token, 'sha256'), 'hex')
    and revoked_at is null;

  if v_operator is null then
    raise exception 'invalid_token' using errcode = '28000';
  end if;

  insert into entries (user_id, kind, label, amount, payment, occurred_on)
  values (v_operator, p_kind, p_label, p_amount, p_payment, p_occurred_on)
  returning * into v_row;

  update api_tokens set last_used_at = now()
  where token_hash = encode(digest(p_token, 'sha256'), 'hex');

  return v_row;
end;
$$;

revoke all on function create_entry_via_token from public;
grant execute on function create_entry_via_token to anon;
```

Note: enforce amount/label/payment shape in the Route Handler before calling, but the DB still has the `amount >= 0` check and enum types as a backstop.

## 3. Shared normalization

Extract the boundary rules from `app/actions/entries.ts` (`parseAmount`, `toIsoDate`, `isPaymentType`, the "default label to Venta/Gasto" rule) into a small module, e.g. `lib/entries/normalize.ts`, and have **both** the existing server actions and the new route import it. This prevents the two write paths from drifting.

## 4. API route: `POST /api/shortcut/entries`

New `app/api/shortcut/entries/route.ts` (Route Handler, runs server-side):

- **Auth**: read `Authorization: Bearer <token>`; 401 if missing.
- **Body** (JSON):
  ```json
  { "kind": "sale", "amount": 5000, "label": "Empanadas", "date": "2026-06-19", "payment": "cash" }
  ```
- **Defaults**:
  - `label` -> "Venta" / "Gasto" by kind (reuse the shared rule).
  - `payment` -> `cash`.
  - `date` -> **today in `America/Argentina/Buenos_Aires`**, computed explicitly (the server runs in UTC, so do not call the client `getTodaysDate()`):
    ```ts
    const todayAR = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Argentina/Buenos_Aires",
    }).format(new Date()); // "YYYY-MM-DD"
    ```
- **Validate** via the shared normalizers; 400 on bad amount/kind/payment/date.
- **Insert**: anon Supabase client, `supabase.rpc("create_entry_via_token", {...})`. Map the `invalid_token` exception to **401**, success to **201** with a small JSON summary.
- Keep responses tiny and friendly so the Shortcut can show a confirmation ("Venta de $5.000 registrada").

Optional `kind` could be split into two routes or kept as a body field; a body field keeps it to one endpoint.

## 5. Token provisioning

**Phase 1 (manual, ships first):** since Lucas sets up mom's phone, generate one token by hand:
- Generate a random token (e.g. 32 bytes base64url) locally.
- Insert its SHA-256 hash into `api_tokens` for her `operator_id` (one-off SQL or a tiny script).
- Build the Shortcut on her phone with that token (section 6).

**Phase 2 (optional, later):** a "Conectar con Siri" screen in the app that creates a token, shows it once, and lets her revoke. Only worth it when a second Operator wants it. The `api_tokens` RLS policy already supports a self-serve UI.

## 6. iOS Shortcut recipe (built once, shared as iCloud links)

Decision: **two hands-free shortcuts**, "Venta" and "Gasto", so there is no
menu tap. Mom says "Oye Siri, venta", then the amount, and that is it. We skip
the concept question to stay fully hands-free (the server defaults the label).
Instead of baking the token into each shortcut, each one carries an **Import
Question** that asks the installer for their token on add, so one pair of links
serves every Operator.

"Venta":
1. **Text** -> empty; holds the token (filled by the Import Question).
2. **Ask for Input** -> Text, prompt "¿Cuánto?" -> `Amount` (Text, not Number:
   Siri mangles spoken thousands like "161.000" as Number; the server parses the
   es-AR text via `parseSpokenAmount`).
3. **Get Contents of URL**:
   - URL: `https://<app-domain>/api/shortcut/entries`
   - Method: `POST`
   - Headers: `Authorization: Bearer <Token text>`, `Content-Type: application/json`
   - Request Body (JSON): `{ "kind": "sale", "amount": <Amount> }`
4. (recommended) **Speak Text** with the response `message` so Siri reads back
   the confirmation hands-free.
5. **Import Question** pointed at the Text action: "Pegá tu token de Carrito".
6. Name it **"Venta"**, then Share -> Copy iCloud Link.

"Gasto": duplicate "Venta", change `"kind"` to `"expense"`, rename to **"Gasto"**,
share its own iCloud link.

The two links go into `NEXT_PUBLIC_SIRI_VENTA_URL` and `NEXT_PUBLIC_SIRI_GASTO_URL`;
the Conectar con Siri screen renders an "Agregar" button for each. Spanish Siri
works fine; the trigger phrase is the shortcut's name. Full click-by-click
walkthrough in [the build guide](./siri-shortcut-build-guide.md).

## 7. Security considerations

- Token is high-entropy, shown once, stored only as a hash. Compromise is limited to creating entries for one Operator (no read, no delete, no cross-tenant access).
- The RPC is the only privileged surface and does exactly one thing. No `service_role` key enters the Next app env.
- Always derive `user_id` from the token inside the function; never accept a client-supplied operator id.
- Consider light rate limiting on the route (e.g. per-token), since it is anon-callable. Low priority for a single trusted user.
- HTTPS only; the token rides in the header.

## 8. Testing

- Unit: shared normalizers (amount/date/payment/label edge cases).
- Route: 401 (no/invalid token), 400 (bad body), 201 (happy path), Argentina-today default near UTC midnight.
- DB: RPC returns the row and stamps `last_used_at`; revoked token fails.
- Manual: run the Shortcut end-to-end on device; confirm the entry appears on the correct day.

## 9. Milestones

1. Migration: `api_tokens` table + `create_entry_via_token` function + grants.
2. Refactor: extract `lib/entries/normalize.ts`; point server actions at it.
3. Route Handler: `app/api/shortcut/entries/route.ts`.
4. Provision mom's token (manual) + build her Shortcuts.
5. (Later) in-app token management screen.

## 10. Open questions

- One endpoint with `kind` in the body, or two routes? (Leaning: one endpoint.)
- Do we want a spoken confirmation read back by Siri, or just a silent success? (Shortcut can speak the response.)
- Should the Shortcut allow a spoken date ("ayer"), or always default to today? (Resolved: default today, with an **optional** "¿Es de hoy?" branch that asks for a spoken date and sends it as `yyyy-MM-dd`. No server change needed: the route already accepts `date` and falls back to today when blank. See the build guide, Step 6b.)
