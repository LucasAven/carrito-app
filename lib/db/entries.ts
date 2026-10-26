import { endOfMonth, parse, startOfMonth } from "date-fns";

import { createClient } from "@/lib/supabase/server";
import { PaymentType } from "@/types/balance";
import type { Database } from "@/types/supabase";
import { getFullDateIso } from "@/utils";

export type Entry = Database["public"]["Tables"]["entries"]["Row"];
export type EntryKind = Database["public"]["Enums"]["entry_kind"];

interface ListOptions {
  paymentTypes?: PaymentType[];
}

const BASE_SELECT =
  "id, user_id, kind, label, amount, payment, occurred_on, created_at, deleted_at, extraordinary";

const PAGE_SIZE = 1000;

// Postgrest returns numeric(12,2) as string. Normalize at the boundary so the
// rest of the app can do arithmetic without thinking about it.
const normalize = (rows: unknown[]): Entry[] =>
  rows.map((row) => {
    const r = row as Entry & { amount: string | number };
    return {
      ...r,
      amount: typeof r.amount === "string" ? Number(r.amount) : r.amount,
    };
  });

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

const entriesQuery = (supabase: SupabaseClient, options?: ListOptions) => {
  const query = supabase
    .from("entries")
    .select(BASE_SELECT, { count: "exact" })
    .is("deleted_at", null);

  return options?.paymentTypes?.length
    ? query.in("payment", options.paymentTypes)
    : query;
};

type EntriesQuery = ReturnType<typeof entriesQuery>;

// PostgREST caps every response at the project's max_rows (1000 by default)
// and a capped response looks exactly like a complete one, so a long year or
// the whole history would silently lose its newest rows. Keep requesting the
// next slice until the exact count is reached. Advancing by what actually came
// back keeps this correct whatever max_rows is set to, and the id tiebreaker
// keeps the slices from overlapping.
async function listAllPages(
  narrow: (query: EntriesQuery) => EntriesQuery,
  options?: ListOptions,
): Promise<Entry[]> {
  const supabase = await createClient();
  const rows: Entry[] = [];

  for (;;) {
    const { count, data, error } = await narrow(entriesQuery(supabase, options))
      .order("id", { ascending: true })
      .range(rows.length, rows.length + PAGE_SIZE - 1);
    if (error) throw error;

    rows.push(...normalize(data ?? []));
    if (!data?.length || rows.length >= (count ?? 0)) return rows;
  }
}

export async function listEntriesByDate(
  date: string,
  options?: ListOptions,
): Promise<Entry[]> {
  if (!date) return [];

  return listAllPages(
    (query) =>
      query.eq("occurred_on", date).order("created_at", { ascending: true }),
    options,
  );
}

export async function listEntriesByWeek(
  start: string,
  end: string,
  options?: ListOptions,
): Promise<Entry[]> {
  if (!start || !end) return [];

  return listAllPages(
    (query) =>
      query
        .gte("occurred_on", start)
        .lte("occurred_on", end)
        .order("occurred_on", { ascending: true })
        .order("created_at", { ascending: true }),
    options,
  );
}

export async function listEntriesByMonth(
  month: string,
  options?: ListOptions,
): Promise<Entry[]> {
  if (!month) return [];

  const parsed = parse(month, "MMM-yyyy", new Date());
  if (parsed.toString() === "Invalid Date") return [];

  const start = getFullDateIso(startOfMonth(parsed));
  const end = getFullDateIso(endOfMonth(parsed));

  return listEntriesByWeek(start, end, options);
}

export async function listEntriesByYear(
  year: string,
  options?: ListOptions,
): Promise<Entry[]> {
  if (!/^\d{4}$/.test(year)) return [];

  const start = `${year}-01-01`;
  const end = `${year}-12-31`;

  return listEntriesByWeek(start, end, options);
}

export async function listAllEntries(options?: ListOptions): Promise<Entry[]> {
  return listAllPages(
    (query) =>
      query
        .order("occurred_on", { ascending: true })
        .order("created_at", { ascending: true }),
    options,
  );
}

// Postgres rejects a malformed date literal, so a junk span reads as empty here
// rather than throwing out of the page that asked for it.
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// Sums the extraordinary expenses booked in a span. It deliberately takes no
// payment filter: the Balance card reports the whole month (or year, or period)
// regardless of how the Operator paid, while Ingresos and Egresos keep
// respecting the filter. The check constraint already limits the flag to
// expenses, so `kind` needs no clause here.
export async function sumExtraordinaryExpenses(
  start: string,
  end: string,
): Promise<number> {
  if (!ISO_DATE.test(start) || !ISO_DATE.test(end)) return 0;

  const rows = await listAllPages((query) =>
    query
      .eq("extraordinary", true)
      .gte("occurred_on", start)
      .lte("occurred_on", end),
  );
  return rows.reduce((sum, row) => sum + row.amount, 0);
}
