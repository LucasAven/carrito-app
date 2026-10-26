import { endOfMonth, parse, startOfMonth } from "date-fns";

import { createClient } from "@/lib/supabase/server";
import { PaymentType } from "@/types/balance";
import type { Database } from "@/types/supabase";

export type Entry = Database["public"]["Tables"]["entries"]["Row"];
export type EntryKind = Database["public"]["Enums"]["entry_kind"];

interface ListOptions {
  paymentTypes?: PaymentType[];
}

const BASE_SELECT =
  "id, user_id, kind, label, amount, payment, occurred_on, created_at, deleted_at, extraordinary";

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

export async function listEntriesByDate(
  date: string,
  options?: ListOptions,
): Promise<Entry[]> {
  if (!date) return [];

  const supabase = await createClient();
  let query = supabase
    .from("entries")
    .select(BASE_SELECT)
    .is("deleted_at", null)
    .eq("occurred_on", date)
    .order("created_at", { ascending: true });

  if (options?.paymentTypes?.length) {
    query = query.in("payment", options.paymentTypes);
  }

  const { data, error } = await query;
  if (error) throw error;
  return normalize(data ?? []);
}

export async function listEntriesByWeek(
  start: string,
  end: string,
  options?: ListOptions,
): Promise<Entry[]> {
  if (!start || !end) return [];

  const supabase = await createClient();
  let query = supabase
    .from("entries")
    .select(BASE_SELECT)
    .is("deleted_at", null)
    .gte("occurred_on", start)
    .lte("occurred_on", end)
    .order("occurred_on", { ascending: true })
    .order("created_at", { ascending: true });

  if (options?.paymentTypes?.length) {
    query = query.in("payment", options.paymentTypes);
  }

  const { data, error } = await query;
  if (error) throw error;
  return normalize(data ?? []);
}

export async function listEntriesByMonth(
  month: string,
  options?: ListOptions,
): Promise<Entry[]> {
  if (!month) return [];

  const parsed = parse(month, "MMM-yyyy", new Date());
  if (parsed.toString() === "Invalid Date") return [];

  const start = startOfMonth(parsed).toISOString().split("T")[0];
  const end = endOfMonth(parsed).toISOString().split("T")[0];

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
  const supabase = await createClient();
  let query = supabase
    .from("entries")
    .select(BASE_SELECT)
    .is("deleted_at", null)
    .order("occurred_on", { ascending: true });

  if (options?.paymentTypes?.length) {
    query = query.in("payment", options.paymentTypes);
  }

  const { data, error } = await query;
  if (error) throw error;
  return normalize(data ?? []);
}

// Sums the extraordinary expenses booked in a span. It deliberately takes no
// payment filter: the Balance card reports the whole month (or year, or period)
// regardless of how the Operator paid, while Ingresos and Egresos keep
// respecting the filter. The check constraint already limits the flag to
// expenses, so `kind` needs no clause here.
export async function sumExtraordinaryExpenses(
  start: string,
  end: string,
): Promise<number> {
  if (!start || !end) return 0;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("entries")
    .select("amount")
    .is("deleted_at", null)
    .eq("extraordinary", true)
    .gte("occurred_on", start)
    .lte("occurred_on", end);

  if (error) throw error;
  return (data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
}

export interface EntryTotals {
  earnings: number;
  expenses: number;
  extraordinary: number;
  total: number;
}

// `expenses` is ordinary expenses only, so `total` is the net the Operator
// lives by: an extraordinary spend is reported on its own and never nets off a
// day's profit.
export function summarizeEntries(entries: Entry[]): EntryTotals {
  let earnings = 0;
  let expenses = 0;
  let extraordinary = 0;
  for (const entry of entries) {
    if (entry.kind === "sale") earnings += entry.amount;
    else if (entry.extraordinary) extraordinary += entry.amount;
    else expenses += entry.amount;
  }
  return { earnings, expenses, extraordinary, total: earnings - expenses };
}
