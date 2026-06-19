# Carrito App

A web app for tracking the daily earnings and expenses of a food truck business. Multi-tenant: each Operator keeps their own books, with no cross-visibility (see [ADR-0002](./docs/adr/0002-multi-tenant-from-day-one.md)). Always-online (see [ADR-0001](./docs/adr/0001-always-online.md)). All Operators are assumed to be in `America/Argentina/Buenos_Aires`; "today" is computed in that timezone.

## Language

**Operator**:
A signed-in user who owns and manages one set of books. The unit of tenancy. Each Operator's data is isolated.
_Avoid_: User (too generic), tenant (too SaaSy), account, owner.

**Entry**:
A single record of money in or out. Parent term for either a Sale or an Expense. Tagged to a calendar day (the Occurred-on date), not a moment in time. The Operator chooses the day, which may be in the past (retroactive entry is the normal workflow).
_Avoid_: Transaction, record, item.

**Occurred-on**:
The calendar day an Entry is booked against. Operator-chosen. Distinct from when the Entry was logged (which is internal, never shown). A new Entry defaults its Occurred-on to the day the Operator is currently viewing, not today (see [ADR-0003](./docs/adr/0003-new-entries-default-to-viewed-day.md)).
_Avoid_: Date, timestamp, when.

**Amount**:
The peso value of an Entry. Always positive. Stored at two decimals of precision but displayed as whole pesos formatted in Argentine convention (e.g. `$ 12.500`). All Operators are ARS today; currency lives on the Operator profile to leave the door open for USD or other currencies later.
_Avoid_: Value, monto (Spanish UI term, reserved for the form label), price.

**Payment-type**:
How an Entry was settled. A closed enum, today: `cash` (Efectivo) and `mercado_pago` (Mercado Pago). Applies to both Sales and Expenses, because Operators need to reconcile cash-on-hand against digital balances. Extending the enum is a schema migration, not a UI change.
_Avoid_: Method, instrument, channel, forma de pago (Spanish UI label only).

**Soft-deleted Entry**:
An Entry the Operator has deleted. Stamped with a `deleted_at`, hidden from every read query, but still in the database. Recoverable by an admin (manual SQL today; no trash UI). Edits, in contrast, mutate the row in place: there is no version history.
_Avoid_: Archived (different connotation), trashed.

**Sale**:
One earning record (money coming in). Surfaced in the UI as _Venta_.
_Avoid_: Earning, income, ingreso (the singular).

**Expense**:
One outflow record (money going out). Surfaced in the UI as _Gasto_.
_Avoid_: Cost, outflow, egreso (the singular).

**Ingresos** (UI-only aggregate):
Sum of Sales over a date range. Shown in the Balance card and tab label.
_Avoid_: Using as a synonym for Sale.

**Egresos** (UI-only aggregate):
Sum of Expenses over a date range. Shown in the Balance card and tab label.
_Avoid_: Using as a synonym for Expense.
