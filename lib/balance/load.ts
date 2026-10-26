import { endOfMonth, format, isValid, parse, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";

import { URL_FILTERS } from "@/constants/routes";
import {
	type Entry,
	listEntriesByDate,
	listEntriesByMonth,
	listEntriesByWeek,
	listEntriesByYear,
	sumExtraordinaryExpenses,
} from "@/lib/db/entries";
import { type EntryTotals, summarizeEntries } from "@/lib/entries/totals";
import {
	convertUrlWeekRangeToWeeksDates,
	getFiltersFromSearchParams,
	getFullDateIso,
	getTodaysDate,
	parseRangeUrl,
} from "@/utils";

export interface PeriodParams {
	date?: string;
	month?: string;
	range?: string;
	week?: string;
	year?: string;
}

// The "Gastos extraordinarios" figure of the Balance card. It is its own
// section because the amount is excluded from Ingresos, Egresos and the net,
// and the label has to name the span it covers, which is not always the span
// the entry list shows.
export interface ExtraordinarySection {
	label: string;
	total: number;
}

interface Span {
	end: string;
	start: string;
}

// A day view reports its whole calendar month, so a one-off purchase stays on
// screen all month instead of showing up on the single day it was booked.
const monthSpan = (anchor: Date): Span | null =>
	isValid(anchor)
		? {
				end: getFullDateIso(endOfMonth(anchor)),
				start: getFullDateIso(startOfMonth(anchor)),
			}
		: null;

// Human-readable label for the active scope, e.g. "Balance de Junio". Shared by
// the Balance ledger and the export report so they always name the period the
// same way.
export function getPeriodLabel({
	date,
	month,
	range,
	week,
	year,
}: PeriodParams): string {
	try {
		if (year) return `Balance de ${year}`;
		if (week) return "Balance de la semana";
		if (range) {
			const parsed = parseRangeUrl(range);
			if (parsed) {
				const from = new Date(`${parsed.from}T00:00:00`);
				const to = new Date(`${parsed.to}T00:00:00`);
				return `Del ${format(from, "d MMM", { locale: es })} al ${format(
					to,
					"d MMM yyyy",
					{ locale: es },
				)}`;
			}
		}
		if (month) {
			const parsed = parse(month, "MMM-yyyy", new Date());
			const name = format(parsed, "MMMM", { locale: es });
			return `Balance de ${name.charAt(0).toUpperCase()}${name.slice(1)}`;
		}
		if (date) {
			if (date === getTodaysDate()) return "Balance de hoy";
			return `Balance del ${format(new Date(`${date}T00:00:00`), "d 'de' MMM", {
				locale: es,
			})}`;
		}
	} catch {
		// fall through to default
	}
	return "Balance";
}

// Resolves the active scope (date | week | month | year + payment filters) to
// its entries and totals. The single source of truth for "what is the Operator
// currently looking at", reused by the Balance ledger and the export report.
export async function loadBalanceEntries(
	searchParams: URLSearchParams,
): Promise<
	{ entries: Entry[]; extraordinarySection: ExtraordinarySection } & EntryTotals
> {
	const date = searchParams.get(URL_FILTERS.DATE) ?? "";
	const week = searchParams.get(URL_FILTERS.WEEK) ?? "";
	const month = searchParams.get(URL_FILTERS.MONTH) ?? "";
	const year = searchParams.get(URL_FILTERS.YEAR) ?? "";
	const range = searchParams.get(URL_FILTERS.RANGE) ?? "";
	const filters = getFiltersFromSearchParams(searchParams);
	const options = { paymentTypes: filters.paymentTypes };

	let entriesQuery: Promise<Entry[]> = Promise.resolve([]);
	// Resolved in the same pass as the entry list so the two can never disagree
	// about which period is on screen. The span is the list's own, except in a
	// day view, where it widens to the month.
	let extraordinaryLabel = "Gastos extraordinarios del período";
	let extraordinarySpan: Span | null = null;

	if (date) {
		entriesQuery = listEntriesByDate(date, options);
		extraordinaryLabel = "Gastos extraordinarios del mes";
		extraordinarySpan = monthSpan(new Date(`${date}T00:00:00`));
	} else if (week) {
		const weekRange = convertUrlWeekRangeToWeeksDates(week);
		const start = weekRange?.weekStart?.toISOString().split("T")[0];
		const end = weekRange?.weekEnd?.toISOString().split("T")[0];
		entriesQuery = listEntriesByWeek(start, end, options);
		extraordinarySpan = { end, start };
	} else if (month) {
		entriesQuery = listEntriesByMonth(month, options);
		extraordinaryLabel = "Gastos extraordinarios del mes";
		extraordinarySpan = monthSpan(parse(month, "MMM-yyyy", new Date()));
	} else if (year) {
		entriesQuery = listEntriesByYear(year, options);
		extraordinaryLabel = "Gastos extraordinarios del año";
		extraordinarySpan = { end: `${year}-12-31`, start: `${year}-01-01` };
	} else if (range) {
		// A custom range is just a bounded span, so it rides the same start/end
		// query the week/month/year scopes resolve down to.
		const parsed = parseRangeUrl(range);
		if (parsed) {
			entriesQuery = listEntriesByWeek(parsed.from, parsed.to, options);
			extraordinarySpan = { end: parsed.to, start: parsed.from };
		}
	}

	const [entries, extraordinaryTotal] = await Promise.all([
		entriesQuery,
		extraordinarySpan
			? sumExtraordinaryExpenses(extraordinarySpan.start, extraordinarySpan.end)
			: 0,
	]);

	return {
		entries,
		extraordinarySection: {
			label: extraordinaryLabel,
			total: extraordinaryTotal,
		},
		...summarizeEntries(entries),
	};
}
