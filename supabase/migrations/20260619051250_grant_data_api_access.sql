-- Supabase's new default (with "Automatically expose new tables" off) does
-- not grant table privileges to the Data API roles. RLS still gates rows,
-- but the role needs base table privileges first or every query 42501s.
-- Grant exactly what the v1 surface needs: read+write on entries
-- (soft-delete via update, no hard delete), read+write on operators.

grant select, insert, update, delete on public.entries to authenticated;
grant select, insert, update on public.operators to authenticated;
