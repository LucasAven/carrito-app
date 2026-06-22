# Stats page (`/stats`, "Resumen") plan

Pulled forward from [v2-wishlist](./v2-wishlist.md). The wishlist sketched a generic
dashboard (payment-type pie, calendar heatmap, sale trends). That was replaced with the
questions the Operator (mom) actually asks after years of selling:

- **Which weekday does she tend to earn the most?**
- **Which month does she tend to earn the most?**

Payment-type breakdown was dropped (almost everything is `cash`). The calendar heatmap and
the generic trend chart were dropped too, superseded by the two questions above.

## Controls (global, drive the whole page)

- **Year selector**: `Todos` (default) plus one pill per year that has data (earliest sale's
  year through the current year). `Todos` is the hero view, the lifetime pattern.
- **Metric toggle**: `Ventas` (gross, default) or `Neto` (`ventas - gastos`). Gross is the
  stable signal since expenses are lumpy. One toggle drives every panel.

## Panels (top to bottom)

1. **Resumen**: total Ventas, total Gastos, Neto, _días trabajados_, _promedio por día
   trabajado_. Reacts to year and toggle.
2. **Tu récord**: single best day for the current scope, with its date. Respects year and toggle.
3. **Mejor día de la semana**: 7 bars, Lun to Dom. Metric is the **average per sales-day**
   (sum of that weekday's value over the count of that weekday's days-with-a-sale). Winner
   highlighted.
4. **Mejor mes**: 12 bars, Ene to Dic. Metric is the **average monthly total across the years
   in range** (a single year is just that year's monthly totals). Winner highlighted.

## Definitions

- **Sales day**: a calendar day (`occurred_on`) with at least 1 **sale** entry. Expense-only
  days are not worked days. Same denominator everywhere, so the numbers reconcile.
- **Day value**: `gross` is that day's sales; `net` is sales minus expenses (can be negative).
- **Monthly total** sums day value over _all_ days that month (expense-only days included, so
  net seasonality stays honest); a month is "active" in a year if it had at least 1 sales day.
- All weekday and month math is over the year-filtered set.

## Tech

- `listAllEntries()` (new, in `lib/db/entries.ts`) pulls all non-deleted entries once
  (RLS-scoped). A food truck over years is at most a few thousand rows.
- `app/stats/page.tsx` (server) fetches, derives the year list, and hands a minimal
  `StatEntry[]` to a **client** `StatsView` that holds year and toggle state and re-aggregates
  **in memory** (instant, no refetch). Pure aggregation lives in `lib/stats/aggregate.ts`.
- **No chart library**. Hand-rolled Tailwind bars using `earn`, `brand`, and `cost` tokens.
- Bottom nav: `[ Balance | Resumen ]`, `ChartColumnIcon`, label "Resumen".
- The add-entry FAB is hidden on `/stats` (a reflection page, not an entry page).
- Empty state: zero sales ever shows "Todavía no hay ventas para mostrar".
