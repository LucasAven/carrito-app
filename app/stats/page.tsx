import { EmptyState } from "@/components/EmptyState";
import Section from "@/components/section";
import StatsView from "@/components/Stats/StatsView";
import { listAllEntries } from "@/lib/db/entries";
import { availableYears, type StatEntry } from "@/lib/stats/aggregate";

export default async function StatsPage() {
	const entries = await listAllEntries();

	const statEntries: StatEntry[] = entries.map((entry) => ({
		amount: entry.amount,
		kind: entry.kind,
		occurred_on: entry.occurred_on,
	}));

	const hasSales = statEntries.some((entry) => entry.kind === "sale");

	return (
		<Section>
			{hasSales ? (
				<StatsView entries={statEntries} years={availableYears(statEntries)} />
			) : (
				<EmptyState
					accent="earn"
					description="Cargá tus ventas para ver tus mejores días y meses acá."
					icon={
						<svg
							aria-hidden="true"
							fill="none"
							height="40"
							stroke="currentColor"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="1.8"
							viewBox="0 0 24 24"
							width="40"
						>
							<line x1="4" x2="4" y1="20" y2="10" />
							<line x1="12" x2="12" y1="20" y2="4" />
							<line x1="20" x2="20" y1="20" y2="14" />
						</svg>
					}
					title="Todavía no hay ventas para mostrar"
				/>
			)}
		</Section>
	);
}
