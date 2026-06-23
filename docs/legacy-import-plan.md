# Legacy data import plan (one-time backfill)

The [v2-wishlist](./v2-wishlist.md) item was "CSV / PDF export", for sharing books
with an accountant. This is the inverse, pulled forward first: a one-time **import**
of mom's history from the previous app she used, so her years of Sales and Expenses
land in Carrito before v1 reaches her hands.

This is a **backfill, not a feature**. There is no import UI, no generic CSV parser,
no re-import/dedupe machinery. It is a hand-run script that reads the known JSON
export shape and writes [Entries](../CONTEXT.md). The parsing/mapping is a pure
function, so if a standing import feature is ever wanted, the core is reusable.

## Source shape

The old app exported one JSON file per year (`2023.json` through `2026.json`), each an
object with two arrays:

```json
{ "sales": [ {…29 fields…} ], "expenses": [ {…29 fields…} ] }
```

Only five fields matter; the other ~24 (store/user/contact/delivery ids, status
flags, etc.) are dropped.

| Source field        | Meaning                      | Maps to              |
| ------------------- | ---------------------------- | -------------------- |
| array membership    | `sales[]` vs `expenses[]`    | `kind`               |
| `transactionTypeId` | `1` = sale, `2` = expense    | `kind` (cross-check) |
| `date`              | epoch **millis as a string** | `occurred_on`        |
| `description`       | free text                    | `label`              |
| `value`             | integer, whole pesos         | `amount`             |
| `paymentTypeId`     | `1` everywhere, `2` once     | _ignored_            |

## Mapping decisions

- **`kind`**: from which array the row lives in. `transactionTypeId` is cross-checked,
  and a mismatch is an abort, not a guess.
- **`occurred_on`**: `date` is epoch millis at a precise instant. Convert to the
  **Buenos Aires** calendar day with a fixed **minus 3h** offset (Argentina has had no
  DST since 2009, so a fixed offset is exact for the whole range; no `date-fns-tz`
  dependency). This matters: read as UTC, **52 of 351 entries (~15%)**, the
  ones logged after 21:00 local, would shift to the wrong day. The source is
  confirmed BA-local by a spike of 103 entries at exactly 00:00 local (days mom
  backdated, stored as local midnight) plus an evening 18:00 to 23:00 cluster.
- **`amount`**: `value` is whole pesos; insert 1:1 as `numeric(12,2)` (`87000` becomes
  `87000.00`). No cents scaling.
- **`label`**: trim and collapse internal whitespace (the data has trailing spaces
  and a double space); keep mom's original text. If a label is empty after trimming,
  default to "Venta"/"Gasto" by kind (matches the live app's `labelForKind`).
- **`payment`**: **everything is `cash`.** `paymentTypeId` is ignored entirely. The
  old data barely tracked it (one `2` across four files), and the [stats plan](./v2-stats-plan.md)
  already treats the books as essentially all-cash.
- **`created_at`**: set from the source `createdAt` ISO timestamp (not `now()`), so
  within-day ordering (`listEntriesByDate` orders by `created_at`) reflects the order
  mom actually logged them. Rows are inserted chronologically.
- **`user_id`**: mom's Operator id, resolved from her email at runtime.

## Mechanics

- **`scripts/import-legacy.mjs`**: plain Node ESM (Node 22, no TS runner, no new
  deps). Uses `@supabase/supabase-js` with the **service-role key** to bypass RLS and
  insert rows with an explicit `user_id`. Email to `user_id` via `auth.admin.listUsers`.
- Run by hand:
  ```
  node --env-file=.env.local scripts/import-legacy.mjs --email=mom@example.com            # dry-run
  node --env-file=.env.local scripts/import-legacy.mjs --email=mom@example.com --commit   # writes
  ```
- **Dry-run by default.** Prints per-file/per-kind counts, the grand total, sum of
  `value` per kind, the `occurred_on` min/max, the resolved email to `user_id`, and 5
  sample mapped rows. Inserts nothing without `--commit`.
- **Safety.** Mom's account is empty; before committing, the script aborts if she
  already has any entries (guards against a double run). Malformed input (missing
  `date`/`value`, kind mismatch) aborts the whole run rather than skipping rows. The
  insert is a single batch; after committing, it re-queries and prints the stored count.
- Requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (Dashboard, then Project
  Settings, then API). The key stays local and is never committed.
- This project has "Automatically expose new tables" off, so `service_role` holds no
  table privileges by default (the app only ever touches these tables as
  `authenticated`). Rather than widen the permanent surface with a tracked migration,
  grant the privilege just for the backfill and revoke it after, in the SQL editor:
  ```sql
  grant select, insert on public.entries to service_role;    -- before the run
  revoke select, insert on public.entries from service_role; -- after it succeeds
  ```

## Disposition

The four `*.json` files hold real financials: **gitignored and deleted** from the
working tree once the backfill is verified. The script is committed (it holds no
secrets) as the record of how the history was loaded.
