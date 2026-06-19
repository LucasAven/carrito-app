-- The original handle_new_user trigger lacked an explicit search_path and
-- relied on the operators policy passing during signup. Auth's signup flow
-- runs the trigger before a session JWT exists, so auth.uid() is null and
-- the RLS WITH CHECK rejected the insert. Recreate the function with the
-- Supabase-recommended pattern: security definer, explicit search_path,
-- schema-qualified table name. Security definer + postgres owner bypasses
-- RLS, so the operators row is created cleanly.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.operators (id) values (new.id);
  return new;
end;
$$;
