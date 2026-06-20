# V2 Wishlist

Deferred from v1 by deliberate scope decisions. Add here when something is cut "for now"; revisit once v1 is in mom's and aunt's hands.

- **Stats page** (`/stats`). Pie-chart breakdown by payment type, biggest expense categories, sale trends over time. Bottom nav already references it.
- **Calendar heatmap page** (`/calendar`). Month-grid with per-day totals; green/red shading for good days vs heavy spend. The v1 substitute is a jump-to-date popup on the existing DatePicker.
- **Search by label.** UI hidden in v1 but URL wiring (`URL_FILTERS.LABEL`) and `SearchBar` component remain. Surface again if Operators report scrolling fatigue.
- **CSV / PDF export.** For sharing books with an accountant.
- **Receipt photo upload.** Attach images to Expenses.
- **Categories on Expenses.** Fuel, ingredients, supplies, rent, etc.
- **Multi-currency.** Store currency on the Operator profile; allow USD entries.
- **Trash UI for soft-deleted Entries.** Today recoverable only via admin SQL.
- **Real audit trail on edits.** Versioned rows instead of in-place mutation.
- **Per-Operator multi-business.** Today one Operator = one set of books. Could split into Operator → Businesses → Entries.
- **Voice entry via Siri Shortcuts.** "Hey Siri, nueva venta" hitting a token-authed API. Designed in [siri-shortcut-entries-plan](./siri-shortcut-entries-plan.md) and [ADR-0004](./adr/0004-siri-entry-via-shortcut-api.md).

## Deferred upgrades

Held back during the 2026-06 deps refresh because each is a meaningful migration on its own:

- **ESLint 8 → 9.** Forces flat-config migration of `.eslintrc`. No runtime CVE risk so deferring is safe.
- **react-day-picker 8 → 9/10 (and with it date-fns 3 → 4).** v9 renamed the class slots (`caption_label`, `IconLeft`, etc.) used by `components/Calendar/`. Calendar refactor required.
- **tailwindcss 3 → 4.** Config-format rewrite (CSS-first). Touch every Tailwind file.

