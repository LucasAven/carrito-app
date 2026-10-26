-- Extraordinary Expense: a sporadic spend (a gas bottle, filling the car with
-- fuel) the Operator wants to see but never wants mixed into daily or monthly
-- profit. See ADR-0011.
--
-- A flag on the Entry rather than a third entry_kind, so every existing read
-- keeps returning the row and only the totals have to change.
alter table entries
  add column extraordinary boolean not null default false;

-- Only an Expense can be extraordinary. A Sale carrying the flag would be
-- counted in Ingresos and skipped by the extraordinary figure at the same time.
alter table entries
  add constraint entries_extraordinary_expense_only
  check (kind = 'expense' or not extraordinary);
