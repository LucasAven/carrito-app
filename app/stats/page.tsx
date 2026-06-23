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
					description="Cargá tus ventas para ver tus mejores días y meses acá."
					title="Todavía no hay ventas para mostrar"
					showIcon
				/>
			)}
		</Section>
	);
}
