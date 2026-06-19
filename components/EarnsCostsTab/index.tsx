/** biome-ignore-all lint/correctness/useUniqueElementIds: here the IDs are unique */
"use client";

import { type FC, useState } from "react";
import { format } from "date-fns/format";

import { EditEntryDrawer } from "@/components/Drawers/EditEntryDrawer";
import { EmptyState } from "@/components/EmptyState";
import type { Entry } from "@/lib/db/entries";
import { PAYMENT_TYPE_LABELS } from "@/types/balance";
import { cn } from "@/utils/cn";

interface EarnsCostsTabProps {
	entries: Entry[];
}

const SalesEmptyIcon = (
	<svg
		aria-hidden="true"
		fill="none"
		height="40"
		stroke="currentColor"
		strokeLinecap="round"
		strokeLinejoin="round"
		strokeWidth="1.9"
		viewBox="0 0 24 24"
		width="40"
	>
		<path d="M16 7l-9 9" />
		<path d="M9 7h7v7" />
	</svg>
);

const ExpensesEmptyIcon = (
	<svg
		aria-hidden="true"
		fill="none"
		height="40"
		stroke="currentColor"
		strokeLinecap="round"
		strokeLinejoin="round"
		strokeWidth="2"
		viewBox="0 0 24 24"
		width="40"
	>
		<circle cx="12" cy="12" r="9" />
		<path d="M8.5 12.5l2.2 2.2 4.8-5" />
	</svg>
);

const formatAmount = (value: number) =>
	new Intl.NumberFormat("es-AR", {
		currency: "ARS",
		maximumFractionDigits: 0,
		style: "currency",
	}).format(value);

const TabPanel = ({
	ariaLabelledBy,
	entries,
	isEarnTab,
	isSelected,
	onEntryClick,
}: {
	ariaLabelledBy: string;
	entries: Entry[];
	isEarnTab: boolean;
	isSelected: boolean;
	onEntryClick: (entry: Entry) => void;
}) => (
	<div
		aria-hidden={!isSelected}
		aria-labelledby={ariaLabelledBy}
		className="mt-4 aria-hidden:hidden"
		role="tabpanel"
		// biome-ignore lint/a11y/noNoninteractiveTabindex: the div needs to be focusable to allow keyboard users to scroll through the entries
		tabIndex={0}
	>
		{entries.length === 0 ? (
			isEarnTab ? (
				<EmptyState
					accent="earn"
					description="Cuando registres una venta va a aparecer en esta lista."
					icon={SalesEmptyIcon}
					title="Sin ventas todavía"
				/>
			) : (
				<EmptyState
					accent="earn"
					description="¡Buenísimo! Todavía no registraste gastos. Toda la venta es ganancia."
					icon={ExpensesEmptyIcon}
					title="Sin gastos todavía"
				/>
			)
		) : (
			<ul className="grid grid-cols-1 gap-2.5 pb-4">
				{entries.map((entry) => (
					<li key={entry.id}>
						<button
							className="bg-surface dark:bg-surface-dark flex w-full items-center gap-3 rounded-[18px] px-4 py-3.5 text-left shadow-[0_2px_9px_rgba(58,42,34,0.06)]"
							onClick={() => onEntryClick(entry)}
							type="button"
						>
							<div className="min-w-0 flex-1">
								<p className="text-ink dark:text-ink-dark truncate font-extrabold">
									{entry.label}
								</p>
								<span className="bg-badge dark:bg-badge-dark text-muted dark:text-muted-dark mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold">
									{PAYMENT_TYPE_LABELS[entry.payment]} ·{" "}
									{format(new Date(`${entry.occurred_on}T00:00:00`), "dd MMM")}
								</span>
							</div>
							<span
								className={cn(
									"font-display shrink-0 text-lg font-bold whitespace-nowrap",
									isEarnTab
										? "text-earn dark:text-earn-dark"
										: "text-cost dark:text-cost-dark",
								)}
							>
								{isEarnTab
									? formatAmount(entry.amount)
									: `-${formatAmount(entry.amount)}`}
							</span>
						</button>
					</li>
				))}
			</ul>
		)}
	</div>
);

const EarnsCostsTab: FC<EarnsCostsTabProps> = ({ entries }) => {
	const [selectedTab, setSelectedTab] = useState(0);
	const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

	const earnings = entries.filter((entry) => entry.kind === "sale");
	const expenses = entries.filter((entry) => entry.kind === "expense");

	return (
		<div>
			<div
				aria-orientation="horizontal"
				className="flex gap-2.5"
				role="tablist"
				tabIndex={0}
			>
				<button
					aria-selected={selectedTab === 0}
					className="bg-surface dark:bg-surface-dark text-muted dark:text-muted-dark aria-selected:bg-brand rounded-full px-5 py-2.5 text-sm font-bold aria-selected:font-extrabold aria-selected:text-white aria-selected:shadow-[0_4px_10px_rgba(224,97,62,0.28)]"
					id="trigger-earnings"
					onClick={() => setSelectedTab(0)}
					role="tab"
					type="button"
				>
					<span>Ingresos</span>
				</button>
				<button
					aria-selected={selectedTab === 1}
					className="bg-surface dark:bg-surface-dark text-muted dark:text-muted-dark aria-selected:bg-brand rounded-full px-5 py-2.5 text-sm font-bold aria-selected:font-extrabold aria-selected:text-white aria-selected:shadow-[0_4px_10px_rgba(224,97,62,0.28)]"
					id="trigger-expenses"
					onClick={() => setSelectedTab(1)}
					role="tab"
					type="button"
				>
					<span>Egresos</span>
				</button>
			</div>

			<TabPanel
				ariaLabelledBy="trigger-earnings"
				entries={earnings}
				isSelected={selectedTab === 0}
				onEntryClick={setEditingEntry}
				isEarnTab
			/>

			<TabPanel
				ariaLabelledBy="trigger-expenses"
				entries={expenses}
				isEarnTab={false}
				isSelected={selectedTab === 1}
				onEntryClick={setEditingEntry}
			/>

			<EditEntryDrawer
				entry={editingEntry}
				onClose={() => setEditingEntry(null)}
			/>
		</div>
	);
};

export default EarnsCostsTab;
