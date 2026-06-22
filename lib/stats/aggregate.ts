import { getDay, getMonth, getYear, parseISO } from "date-fns";

export type StatMetric = "gross" | "net";

/** The minimal entry shape the stats page needs (serialized server to client). */
export interface StatEntry {
	amount: number;
	kind: "sale" | "expense";
	occurred_on: string; // yyyy-MM-dd
}

/** A year filter: a concrete year, or "all" for the lifetime view. */
export type YearFilter = number | "all";

/** Spanish labels, Monday-first and January-first to match the panels. */
export const WEEKDAY_LABELS_SHORT = [
	"Lun",
	"Mar",
	"Mié",
	"Jue",
	"Vie",
	"Sáb",
	"Dom",
] as const;

export const WEEKDAY_LABELS_LONG = [
	"lunes",
	"martes",
	"miércoles",
	"jueves",
	"viernes",
	"sábado",
	"domingo",
] as const;

export const MONTH_LABELS_SHORT = [
	"Ene",
	"Feb",
	"Mar",
	"Abr",
	"May",
	"Jun",
	"Jul",
	"Ago",
	"Sep",
	"Oct",
	"Nov",
	"Dic",
] as const;

export const MONTH_LABELS_LONG = [
	"enero",
	"febrero",
	"marzo",
	"abril",
	"mayo",
	"junio",
	"julio",
	"agosto",
	"septiembre",
	"octubre",
	"noviembre",
	"diciembre",
] as const;

interface DayRollup {
	date: string;
	expenses: number;
	month: number;
	// 0=Mon .. 6=Sun
	sales: number;
	salesCount: number;
	// 0-11
	weekday: number;
	// yyyy-MM-dd
	year: number;
}

/** One labelled bar in a panel. */
export interface Bar {
	/** Sample size: sales-days for weekdays, active years for months. */
	count: number;
	/** Index into the panel's label array (weekday 0-6 or month 0-11). */
	index: number;
	/** True for the highest-value bucket with data. */
	isWinner: boolean;
	/** The metric value for this bucket (average, can be negative for net). */
	value: number;
}

export interface StatsSummary {
	/** Total (gross or net) over worked days. */
	averagePerWorkedDay: number;
	net: number;
	totalExpenses: number;
	totalSales: number;
	/** Days with at least one sale. */
	workedDays: number;
}

export interface RecordDay {
	date: string; // yyyy-MM-dd
	value: number;
}

const dayValue = (r: DayRollup, metric: StatMetric): number =>
	metric === "gross" ? r.sales : r.sales - r.expenses;

const isSalesDay = (r: DayRollup): boolean => r.salesCount > 0;

/** Collapse entries into one rollup per calendar day. */
function rollupByDay(entries: StatEntry[]): DayRollup[] {
	const byDate = new Map<string, DayRollup>();

	for (const entry of entries) {
		let rollup = byDate.get(entry.occurred_on);
		if (!rollup) {
			const parsed = parseISO(entry.occurred_on);
			rollup = {
				date: entry.occurred_on,
				expenses: 0,
				month: getMonth(parsed),
				sales: 0,
				salesCount: 0,
				// date-fns getDay is 0=Sun..6=Sat; shift so Monday is 0.
				weekday: (getDay(parsed) + 6) % 7,
				year: getYear(parsed),
			};
			byDate.set(entry.occurred_on, rollup);
		}

		if (entry.kind === "sale") {
			rollup.sales += entry.amount;
			rollup.salesCount += 1;
		} else {
			rollup.expenses += entry.amount;
		}
	}

	return Array.from(byDate.values());
}

const markWinner = (bars: Bar[]): Bar[] => {
	let winnerIndex = -1;
	let best = -Infinity;
	for (const bar of bars) {
		if (bar.count > 0 && bar.value > best) {
			best = bar.value;
			winnerIndex = bar.index;
		}
	}
	return bars.map((bar) => ({ ...bar, isWinner: bar.index === winnerIndex }));
};

/** The years (ascending) that have any entry, for the year selector. */
export function availableYears(entries: StatEntry[]): number[] {
	const years = new Set<number>();
	for (const entry of entries) years.add(getYear(parseISO(entry.occurred_on)));
	return Array.from(years).sort((a, b) => a - b);
}

/** Everything the page renders, derived for one (year, metric) selection. */
export interface StatsResult {
	months: Bar[];
	record: RecordDay | null;
	summary: StatsSummary;
	weekdays: Bar[];
}

export function computeStats(
	entries: StatEntry[],
	year: YearFilter,
	metric: StatMetric,
): StatsResult {
	const rollups = rollupByDay(entries).filter(
		(r) => year === "all" || r.year === year,
	);

	// Summary: totals span all days; worked-day math uses sales-days only.
	let totalSales = 0;
	let totalExpenses = 0;
	let workedDays = 0;
	for (const r of rollups) {
		totalSales += r.sales;
		totalExpenses += r.expenses;
		if (isSalesDay(r)) workedDays += 1;
	}
	const net = totalSales - totalExpenses;
	const summaryTotal = metric === "gross" ? totalSales : net;
	const summary: StatsSummary = {
		averagePerWorkedDay: workedDays > 0 ? summaryTotal / workedDays : 0,
		net,
		totalExpenses,
		totalSales,
		workedDays,
	};

	// Record: best sales-day by the active metric.
	let record: RecordDay | null = null;
	for (const r of rollups) {
		if (!isSalesDay(r)) continue;
		const value = dayValue(r, metric);
		if (!record || value > record.value) record = { date: r.date, value };
	}

	// Weekday panel: average per sales-day, per weekday.
	const weekdays: Bar[] = Array.from({ length: 7 }, (_, index) => {
		const days = rollups.filter((r) => r.weekday === index && isSalesDay(r));
		const total = days.reduce((sum, r) => sum + dayValue(r, metric), 0);
		return {
			count: days.length,
			index,
			isWinner: false,
			value: days.length > 0 ? total / days.length : 0,
		};
	});

	// Month panel: average monthly total across years active in that month.
	// First, total per (year, month) and whether that year-month had a sale.
	const groups = new Map<string, { hasSale: boolean; total: number }>();
	for (const r of rollups) {
		const key = `${r.year}-${r.month}`;
		let group = groups.get(key);
		if (!group) {
			group = { hasSale: false, total: 0 };
			groups.set(key, group);
		}
		group.total += dayValue(r, metric);
		if (isSalesDay(r)) group.hasSale = true;
	}

	const months: Bar[] = Array.from({ length: 12 }, (_, index) => {
		const active: number[] = [];
		groups.forEach((group, key) => {
			const month = Number(key.split("-")[1]);
			if (month === index && group.hasSale) active.push(group.total);
		});
		const total = active.reduce((sum, value) => sum + value, 0);
		return {
			count: active.length,
			index,
			isWinner: false,
			value: active.length > 0 ? total / active.length : 0,
		};
	});

	return {
		months: markWinner(months),
		record,
		summary,
		weekdays: markWinner(weekdays),
	};
}
