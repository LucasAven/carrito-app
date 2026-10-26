"use client";

import { type FC, useState } from "react";

import { deleteEntry, restoreEntry } from "@/app/actions/entries";
import { Balance } from "@/components/Balance";
import EarnsCostsTab from "@/components/EarnsCostsTab";
import { showToast } from "@/components/Toast";
import type { ExtraordinarySection } from "@/lib/balance/load";
import type { Entry } from "@/lib/db/entries";

const withoutId = (ids: Set<string>, id: string) => {
	const next = new Set(ids);
	next.delete(id);
	return next;
};

interface BalanceViewProps {
	entries: Entry[];
	extraordinary: ExtraordinarySection;
	periodLabel?: string;
}

// Owns the optimistic delete state so both the Balance totals and the entry list
// reflect a removal instantly, before the server delete (and its revalidation)
// round-trips.
const BalanceView: FC<BalanceViewProps> = ({
	entries,
	extraordinary,
	periodLabel,
}) => {
	const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

	const visibleEntries = entries.filter((entry) => !hiddenIds.has(entry.id));

	// Totals are derived here (not via the server's summarizeEntries) so they
	// recompute instantly from the optimistic visible set. Keep this in sync with
	// summarizeEntries in lib/db/entries.ts.
	let earnings = 0;
	let expenses = 0;
	for (const entry of visibleEntries) {
		if (entry.kind === "sale") earnings += entry.amount;
		else if (!entry.extraordinary) expenses += entry.amount;
	}
	const total = earnings - expenses;

	// The extraordinary figure covers a wider span than the list (a day view
	// reports its whole month), so it cannot be recomputed from the visible
	// entries. Subtract the hidden ones instead, which undo puts straight back.
	const visibleExtraordinary = {
		label: extraordinary.label,
		total: entries.reduce(
			(sum, entry) =>
				hiddenIds.has(entry.id) && entry.extraordinary
					? sum - entry.amount
					: sum,
			extraordinary.total,
		),
	};

	const handleDelete = (entry: Entry) => {
		const { id, kind } = entry;
		setHiddenIds((prev) => new Set(prev).add(id));

		void (async () => {
			const result = await deleteEntry(id);
			if (result.error) {
				setHiddenIds((prev) => withoutId(prev, id));
				showToast({ message: "No se pudo eliminar" });
				return;
			}

			showToast({
				actionLabel: "Deshacer",
				message: kind === "expense" ? "Gasto eliminado" : "Venta eliminada",
				onAction: () => {
					setHiddenIds((prev) => withoutId(prev, id));
					void restoreEntry(id);
				},
			});
		})();
	};

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-4">
			{/* The Balance card stays pinned so the period total and the date
			    controls above it remain in view; only the entry list scrolls. */}
			<Balance
				earnings={earnings}
				expenses={expenses}
				extraordinary={visibleExtraordinary}
				periodLabel={periodLabel}
				total={total}
				showExport
			/>
			<div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
				<EarnsCostsTab entries={visibleEntries} onDelete={handleDelete} />
			</div>
		</div>
	);
};

export default BalanceView;
