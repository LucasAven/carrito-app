import type { Entry } from "@/lib/db/entries";

export interface EntryTotals {
	earnings: number;
	expenses: number;
	total: number;
}

// `expenses` is ordinary expenses only, so `total` is the net the Operator
// lives by: an extraordinary spend is reported on its own and never nets off a
// day's profit. Kept free of server imports so the Balance card can recompute
// it on the client after an optimistic delete.
export function summarizeEntries(entries: Entry[]): EntryTotals {
	let earnings = 0;
	let expenses = 0;
	for (const entry of entries) {
		if (entry.kind === "sale") earnings += entry.amount;
		else if (!entry.extraordinary) expenses += entry.amount;
	}
	return { earnings, expenses, total: earnings - expenses };
}
