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
