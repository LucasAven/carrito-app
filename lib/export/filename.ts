import { format, parse } from "date-fns";

import type { PeriodParams } from "@/lib/balance/load";

// Base name (no extension) for an exported file, derived from the active scope
// so the accountant can tell periods apart at a glance, e.g.
// "mi-negocio-2026-06". The CSV and PDF share this stem.
export function exportBaseName({
	date,
	month,
	range,
	week,
	year,
}: PeriodParams): string {
	if (year) return `mi-negocio-${year}`;
	// range arrives as "from_to" (both ISO); both ends already sort
	// chronologically, so just swap the separator for readability.
	if (range) return `mi-negocio-${range.replace("_", "-a-")}`;
	if (month) {
		// month arrives as "MMM-yyyy" (e.g. "jun-2026"); normalize to "2026-06" so
		// filenames sort chronologically.
		const parsed = parse(month, "MMM-yyyy", new Date());
		if (parsed.toString() !== "Invalid Date") {
			return `mi-negocio-${format(parsed, "yyyy-MM")}`;
		}
		return `mi-negocio-${month}`;
	}
	// week arrives as "MM-dd_MM-dd"; the underscore is filename-safe but reads
	// better as a dash.
	if (week) return `mi-negocio-semana-${week.replace("_", "-a-")}`;
	if (date) return `mi-negocio-${date}`;
	return "mi-negocio";
}
