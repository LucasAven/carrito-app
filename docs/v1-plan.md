# V1 Implementation Plan

The locked-in plan for v1 of Carrito App. Pick this up cold: every decision below was made during a prior grilling session and is now binding unless you have a specific reason to revisit.

## Read first

Before touching code, read in this order:

1. [`CONTEXT.md`](../CONTEXT.md): glossary of Operator, Entry, Sale, Expense, Occurred-on, Amount, Payment-type, Soft-deleted Entry. Use these terms consistently in code, comments, and commits.
2. [`docs/adr/0001-always-online.md`](./adr/0001-always-online.md): why no PWA / offline support.
3. [`docs/adr/0002-multi-tenant-from-day-one.md`](./adr/0002-multi-tenant-from-day-one.md): why `user_id` + RLS even with one Operator today.
4. [`docs/v2-wishlist.md`](./v2-wishlist.md): features deliberately deferred. If a task hints at one of these, STOP and confirm with the user before expanding scope.

## Locked decisions (quick reference)

| Area | Decision |
|---|---|
| Stack | Next.js 15 (app router) + React 19 + Tailwind v4 + TypeScript |
| Backend | Supabase (Postgres + Auth + RLS) |
| Hosting | Vercel Hobby (no credit card on file). Spending cap $0 in dashboard. |
| Auth | Email + password. Open sign-ups. Email confirmation ON (Supabase default). |
| Multi-tenancy | Each Operator sees only their own books. Enforced by RLS. |
| Schema | One `entries` table with `kind` enum. No category column (v2). |
| Currency | ARS hardcoded for now. Currency stored on `operators` to leave the door open. |
| Amount UI | Whole pesos. Format with `Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })`. |
| Time | `occurred_on date` (Operator-chosen, may be past). `created_at timestamptz` (auto). Timezone hardcoded `America/Argentina/Buenos_Aires` for "today" computations. |
| Payment types | Closed enum: `cash`, `mercado_pago`. Applies to both Sales and Expenses. |
| Edit | In-place `update` (no version history). |
| Delete | Soft delete via `deleted_at timestamptz`. No trash UI (admin SQL only). Native `confirm()` dialog. |
| Migrations | Supabase CLI + `supabase/migrations/` in repo. Local dev DB via `supabase start`. |
| State | No Zustand. Reads from RSC + server actions for writes. |

## Cost-safety guardrails

**Critical.** Do not add a credit card to Vercel or Supabase. Both free tiers throttle/pause at the limit; they cannot bill you without a card on file.

After deploy:
- Vercel: Settings, Billing, Spend Management, set hard cap at $0.
- Supabase: leave email confirmation ON (default). Add a captcha if abuse appears (10 min job, defer).

Vercel Hobby is technically "non-commercial". A bookkeeping app for a family business is gray-area. Practical enforcement risk is near zero; if Vercel ever flags it, migrate to Cloudflare Pages (free, allows commercial).

## Schema (first migration)

```sql
create type entry_kind   as enum ('sale', 'expense');
create type payment_type as enum ('cash', 'mercado_pago');

create table operators (
  id         uuid primary key references auth.users(id) on delete cascade,
  currency   text not null default 'ARS',
  created_at timestamptz not null default now()
);

create table entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references operators(id) on delete cascade,
  kind        entry_kind not null,
  label       text not null,
  amount      numeric(12,2) not null check (amount >= 0),
  payment     payment_type not null,
  occurred_on date not null,
  created_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create index entries_user_occurred_idx
  on entries (user_id, occurred_on desc)
  where deleted_at is null;

alter table operators enable row level security;
alter table entries   enable row level security;

create policy "own profile" on operators
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "own entries" on entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create function handle_new_user() returns trigger
  language plpgsql security definer as $$
begin
  insert into operators (id) values (new.id);
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
```

## Implementation steps

Make one commit per step. Run `yarn build` after every step; do not move on with a broken build. Use the language from `CONTEXT.md` in commit messages and code (Sale, Expense, Operator, etc.).

### 1. Bootstrap Supabase

- Install Supabase CLI: `brew install supabase/tap/supabase`
- In the repo: `supabase init` (creates `supabase/` directory)
- Create a Supabase project in the dashboard (carrito-app, region `sa-east-1` São Paulo for AR proximity)
- Link locally: `supabase link --project-ref <ref>`
- Add `.env.local` (and `.env.example`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Add `.env.local` to `.gitignore` if not already.
- Optional: `supabase start` to run a local Postgres in Docker for dev.

### 2. First migration (schema above)

- `supabase migration new init_schema`
- Paste the SQL above into the generated file.
- `supabase db push` to apply to the linked project. (And `supabase db reset` to apply to local DB if running.)

### 3. Supabase client wiring

- `yarn add @supabase/ssr @supabase/supabase-js`
- Create `lib/supabase/client.ts` (browser client for client components).
- Create `lib/supabase/server.ts` (server client using `cookies()` from `next/headers`).
- Create `middleware.ts` at repo root for session-cookie refresh (use the @supabase/ssr middleware pattern from their docs).

### 4. Auth flows

- Create `app/(auth)/login/page.tsx`: email + password form, calls `supabase.auth.signInWithPassword`.
- Create `app/(auth)/signup/page.tsx`: email + password form, calls `supabase.auth.signUp`. Show "check your email to confirm" state after submit.
- Create `app/auth/callback/route.ts`: handles the email-confirmation redirect by exchanging the code for a session.
- Update `middleware.ts` to redirect unauthenticated users away from `/balance` (and any other protected route) to `/login`.
- Verify by signing up a test user, confirming the email, and logging in.

### 5. Data access layer (`lib/db/entries.ts`)

Port the four query functions currently in `lib/api.ts` to Supabase:
- `listEntriesByDate(date)`, `listEntriesByWeek(start, end)`, `listEntriesByMonth(month)`, plus a totals function (or compute totals from the list in the caller, pick whichever is cleaner).
- Honor `payment_type` filter (will be wired in step 12 but the function signature should accept it).
- All queries filter `deleted_at is null`.
- All queries are scoped by `user_id` automatically via RLS (no `where user_id = ...` clause needed; the policy enforces it).
- Return shape: keep the existing `{ data, earnings, expenses, total }` shape used by `/balance/page.tsx` so the swap is minimal.

### 6. Swap `/balance` to Supabase

- Update `app/balance/page.tsx` to import from `lib/db/entries.ts` instead of `lib/api.ts`.
- Delete `lib/api.ts` and `public/mock_financial_data.json`.
- Delete `types/balance.ts` shapes that no longer apply; replace with Supabase-typed equivalents (use `supabase gen types typescript --linked > types/supabase.ts` and derive `Entry` from `Database['public']['Tables']['entries']['Row']`).
- Verify `/balance` still renders with real (or empty) data.

### 7. Create Sale

- Add `app/actions/entries.ts` with a `"use server"` `createSale(formData)` server action.
- Wire `components/Drawers/CreateBalanceDrawer.tsx`'s `onSubmit` to call `createSale`. Remove the TODO and the `console.log`.
- After success: close drawer, `revalidatePath("/balance")`.
- The Sale form already captures date, label (sale name), amount, payment type. Map field names to the schema (`occurred_on`, `label`, `amount`, `payment`).

### 8. Create Expense

- Build `components/Drawers/CreateExpenseDrawer.tsx` by mirroring `CreateBalanceDrawer.tsx`. Same fields, same shape. Label the title "Nuevo Gasto".
- Add `createExpense` server action in `app/actions/entries.ts`.
- Wire the bare "Nuevo Gasto" button in `app/layout.tsx` to open the new drawer (matching the pattern used by "Nueva Venta").

### 9. Edit Entry

- Build a single `EditEntryDrawer` that handles both Sales and Expenses. Open with row data, pre-fill form. Title varies by `kind` ("Editar Venta" / "Editar Gasto").
- Add `updateEntry(id, patch)` server action.
- Wire tap-on-row in `components/EarnsCostsTab/` to open the edit drawer with that row's data.

### 10. Soft delete

- Add a delete button inside the edit drawer (red, separated). Use native `window.confirm("¿Eliminar esta venta?")` / `"¿Eliminar este gasto?"` based on `kind`.
- Add `deleteEntry(id)` server action that does `update entries set deleted_at = now() where id = ?`.
- Confirm reads filter `deleted_at is null` (should already be done in step 5).

### 11. Jump-to-date calendar popup

- In `components/DatePicker/DayPicker.tsx` (or wherever the current-date label sits), make the date display tappable.
- On tap, open a dialog containing the existing `components/Calendar` component (react-day-picker v8).
- Selecting a date updates the URL (`?date=YYYY-MM-DD`), closing the dialog.

### 12. Wire filter drawer

- The `FilterDrawer` already writes selected payment types to the URL. Read `URL_FILTERS.PAYMENT_TYPE` in `/balance/page.tsx` and pass to `lib/db/entries.ts` queries.
- Apply as `where payment = any(...)` filter.

### 13. Hide search

- In `components/appbar.tsx`, render `null` (or no element at all) in place of `<SearchBar />`. Leave the `SearchBar.tsx` file and its URL wiring intact, it's a v2 nice-to-have.

### 14. Strip `/stats` and `/calendar` from nav

- Edit `constants/routes.tsx`:
  - Remove `stats` and `calendar` from `InternalRoutes`.
  - Remove the "Estadísticas" entry from `InternalRoutesData`.
- The `/calendar` route was never built; nothing to delete on disk for it.
- `/stats` is referenced but no page exists; safe to drop the nav entry.

### 15. Empty state

- In `/balance/page.tsx`, when the query returns no entries for the current date/week/month, render a Spanish empty state encouraging the first entry. E.g., "Aún no hay ventas ni gastos. Tocá Nueva Venta o Nuevo Gasto para empezar."

### 16. Cleanup

- Remove the leftover `pb-safe` class in `components/bottom-nav.tsx:14` (vestige of the deleted `tailwindcss-safe-area` plugin; harmless but dead).
- Sweep for any remaining references to deleted things (Zustand, next-themes, next-pwa) and remove.

### 17. Deploy

- Push to GitHub.
- In Vercel: import the repo, leave framework preset on Next.js, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as env vars.
- **Do not add a payment method.**
- After first successful deploy: Settings, Billing, Spend Management, set hard cap at $0.
- Test the production URL on phone and desktop with the mom-account flow: sign up, confirm email, log in, create a Sale, edit it, delete it, navigate the date picker.

## Things to NOT do

- Don't bring back `next-pwa`. ADR-0001 says no offline.
- Don't add a payment method to Vercel or Supabase under any circumstances unless the user explicitly asks.
- Don't expand scope into anything in `docs/v2-wishlist.md` without checking first.
- Don't add a category column to `entries`. Deliberately deferred.
- Don't add a time-of-day picker to the create form. `occurred_on` is a `date`, not a timestamp.
- Don't add eslint 9, react-day-picker 9, or date-fns 4. They're deferred (see `docs/v2-wishlist.md`).

## Status tracker

Update this as you go. One line per step.

- [x] 1. Supabase bootstrap
- [x] 2. First migration
- [x] 3. Supabase client wiring
- [x] 4. Auth flows
- [x] 5. Data access layer
- [ ] 6. Swap `/balance` to Supabase
- [ ] 7. Create Sale
- [ ] 8. Create Expense
- [ ] 9. Edit Entry
- [ ] 10. Soft delete
- [ ] 11. Jump-to-date popup
- [ ] 12. Wire filter drawer
- [ ] 13. Hide search
- [ ] 14. Strip stats/calendar from nav
- [ ] 15. Empty state
- [ ] 16. Cleanup
- [ ] 17. Deploy
