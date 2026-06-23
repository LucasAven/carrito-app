import { format, parse } from "date-fns";
import { es } from "date-fns/locale";

import { URL_FILTERS } from "@/constants/routes";
import {
	type Entry,
	type EntryTotals,
	listEntriesByDate,
	listEntriesByMonth,
	listEntriesByWeek,
	listEntriesByYear,
	summarizeEntries,
} from "@/lib/db/entries";
import {
	convertUrlWeekRangeToWeeksDates,
	getFiltersFromSearchParams,
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
): Promise<{ entries: Entry[] } & EntryTotals> {
	const date = searchParams.get(URL_FILTERS.DATE) ?? "";
	const week = searchParams.get(URL_FILTERS.WEEK) ?? "";
	const month = searchParams.get(URL_FILTERS.MONTH) ?? "";
	const year = searchParams.get(URL_FILTERS.YEAR) ?? "";
	const range = searchParams.get(URL_FILTERS.RANGE) ?? "";
	const filters = getFiltersFromSearchParams(searchParams);
	const options = { paymentTypes: filters.paymentTypes };

	let entries: Entry[] = [];

	if (date) {
		entries = await listEntriesByDate(date, options);
	} else if (week) {
		const weekRange = convertUrlWeekRangeToWeeksDates(week);
		const start = weekRange?.weekStart?.toISOString().split("T")[0];
		const end = weekRange?.weekEnd?.toISOString().split("T")[0];
		entries = await listEntriesByWeek(start, end, options);
	} else if (month) {
		entries = await listEntriesByMonth(month, options);
	} else if (year) {
		entries = await listEntriesByYear(year, options);
	} else if (range) {
		// A custom range is just a bounded span, so it rides the same start/end
		// query the week/month/year scopes resolve down to.
		const parsed = parseRangeUrl(range);
		if (parsed) {
			entries = await listEntriesByWeek(parsed.from, parsed.to, options);
		}
	}

	return { entries, ...summarizeEntries(entries) };
}
