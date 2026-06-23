# V2 Wishlist

Deferred from v1 by deliberate scope decisions. Add here when something is cut "for now"; revisit once v1 is in mom's and aunt's hands.

- ~~**Stats page** (`/stats`).~~ **Shipped** as "Resumen" (see [v2-stats-plan](./v2-stats-plan.md)). The pie-chart-by-payment-type, expense categories, and generic trend chart sketched here were deliberately dropped in favor of the two questions the Operator actually asks: best weekday and best month.
- **Calendar heatmap page** (`/calendar`). Month-grid with per-day totals; green/red shading for good days vs heavy spend. The v1 substitute is a jump-to-date popup on the existing DatePicker. (Also dropped from the Resumen page; a standalone heatmap page is still deferred.)
- **Search by label.** UI hidden in v1 but URL wiring (`URL_FILTERS.LABEL`) and `SearchBar` component remain. Surface again if Operators report scrolling fatigue.
- ~~**CSV / PDF export.**~~ **Shipped** as an "Exportar" menu item that opens a print-ready
  report at `/exportar` for the currently-viewed Balance scope (see
  [ADR-0008](./adr/0008-export-via-print-and-client-csv.md)). PDF is the browser's own
  print-to-PDF (no PDF library); CSV is built client-side and shared via the Web Share
  API with a download fallback. The inverse, a one-time **import** of mom's history from
  her previous app, was pulled forward as a hand-run backfill (see
  [legacy-import-plan](./legacy-import-plan.md)).
- **Receipt photo upload.** Attach images to Expenses.
- **Categories on Expenses.** Fuel, ingredients, supplies, rent, etc.
- **Multi-currency.** Store currency on the Operator profile; allow USD entries.
- **Trash UI for soft-deleted Entries.** A post-delete undo toast covers immediate mistakes; once it's dismissed, Entries are recoverable only via admin SQL.
- **Real audit trail on edits.** Versioned rows instead of in-place mutation.
- **Per-Operator multi-business.** Today one Operator = one set of books. Could split into Operator → Businesses → Entries.
- **Voice entry via Siri Shortcuts.** "Hey Siri, nueva venta" hitting a token-authed API. Designed in [siri-shortcut-entries-plan](./siri-shortcut-entries-plan.md) and [ADR-0004](./adr/0004-siri-entry-via-shortcut-api.md).

## Deferred upgrades

Held back during the 2026-06 deps refresh because each is a meaningful migration on its own:

- **ESLint 8 → 9.** Forces flat-config migration of `.eslintrc`. No runtime CVE risk so deferring is safe.
- **react-day-picker 8 → 9/10 (and with it date-fns 3 → 4).** v9 renamed the class slots (`caption_label`, `IconLeft`, etc.) used by `components/Calendar/`. Calendar refactor required.
- **tailwindcss 3 → 4.** Config-format rewrite (CSS-first). Touch every Tailwind file.
