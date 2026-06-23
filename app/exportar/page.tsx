import { Suspense } from "react";
import { format } from "date-fns/format";
import { es } from "date-fns/locale";

import ExportView from "@/components/Export/ExportView";
import Section from "@/components/section";
import { InternalRoutes } from "@/constants/routes";
import { getPeriodLabel, loadBalanceEntries } from "@/lib/balance/load";
import { exportBaseName } from "@/lib/export/filename";
import { getTodaysDate } from "@/utils";

// Renders a print-ready report for the currently-viewed Balance scope, plus a
// toolbar to download/share it as CSV or save it as PDF (via the browser's
// print dialog). The scope arrives as the same query params the Balance ledger
// uses, so "export" always means "export what I'm looking at".
export default async function ExportPage({
	searchParams,
}: {
	searchParams: Promise<{
		date?: string;
		month?: string;
		range?: string;
		week?: string;
		year?: string;
	}>;
}) {
	const resolved = await searchParams;

	// Default to today when the page is opened without a scope (e.g. a bare
	// /exportar visit), mirroring the Balance ledger's own default.
	const params =
		resolved.date ||
		resolved.week ||
		resolved.month ||
		resolved.year ||
		resolved.range
			? resolved
			: { date: getTodaysDate() };

	const convertedSearchParams = new URLSearchParams(
		params as Record<string, string>,
	);

	const { earnings, entries, expenses, total } = await loadBalanceEntries(
		convertedSearchParams,
	);

	const periodLabel = getPeriodLabel(params);
	const baseName = exportBaseName(params);
	const generatedOn = format(
		new Date(`${getTodaysDate()}T00:00:00`),
		"d 'de' MMMM yyyy",
		{ locale: es },
	);

	// Carry the scope back so the "volver" arrow returns to the same Balance view.
	const backHref = `${InternalRoutes.balance}?${convertedSearchParams.toString()}`;

	return (
		<Section className="flex min-h-0 flex-1 flex-col">
			<Suspense fallback={null}>
				<ExportView
					backHref={backHref}
					baseName={baseName}
					earnings={earnings}
					entries={entries}
					expenses={expenses}
					generatedOn={generatedOn}
					periodLabel={periodLabel}
					total={total}
				/>
			</Suspense>
		</Section>
	);
}
