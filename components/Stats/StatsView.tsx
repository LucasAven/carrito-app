"use client";

import { type FC, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

import {
	type Bar,
	computeStats,
	MONTH_LABELS_LONG,
	MONTH_LABELS_SHORT,
	type StatEntry,
	type StatMetric,
	WEEKDAY_LABELS_LONG,
	WEEKDAY_LABELS_SHORT,
	type YearFilter,
} from "@/lib/stats/aggregate";
import { cn } from "@/utils/cn";

interface StatsViewProps {
	entries: StatEntry[];
	years: number[];
}

const formatAmount = (value: number) =>
	new Intl.NumberFormat("es-AR", {
		currency: "ARS",
		maximumFractionDigits: 0,
		style: "currency",
	}).format(value);

const Pill: FC<{
	active: boolean;
	children: React.ReactNode;
	onClick: () => void;
}> = ({ active, children, onClick }) => (
	<button
		className={cn(
			"shrink-0 rounded-full px-4 py-1.5 text-[13px] font-extrabold transition-colors",
			active
				? "bg-brand text-white"
				: "bg-track dark:bg-track-dark text-label dark:text-label-dark",
		)}
		onClick={onClick}
		type="button"
	>
		{children}
	</button>
);

const Card: FC<{ children: React.ReactNode; className?: string }> = ({
	children,
	className,
}) => (
	<div
		className={cn(
			"bg-surface dark:bg-badge-dark rounded-[26px] px-5 py-5 shadow-[0_2px_9px_rgba(58,42,34,0.06)]",
			className,
		)}
	>
		{children}
	</div>
);

const SummaryItem: FC<{ label: string; value: string }> = ({
	label,
	value,
}) => (
	<div>
		<p className="text-muted dark:text-muted-dark text-[11px] font-bold tracking-wide uppercase">
			{label}
		</p>
		<p className="font-display text-ink dark:text-ink-dark mt-0.5 text-lg font-extrabold whitespace-nowrap tabular-nums">
			{value}
		</p>
	</div>
);

const BarRow: FC<{ bar: Bar; label: string; maxAbs: number }> = ({
	bar,
	label,
	maxAbs,
}) => {
	const pct =
		maxAbs > 0 ? Math.max((Math.abs(bar.value) / maxAbs) * 100, 2) : 0;
	const negative = bar.value < 0;

	return (
		<div className="flex items-center gap-2.5">
			<span
				className={cn(
					"w-9 shrink-0 text-[13px] font-bold",
					bar.isWinner
						? "text-ink dark:text-ink-dark"
						: "text-muted dark:text-muted-dark",
				)}
			>
				{label}
			</span>
			<div className="bg-track dark:bg-track-dark relative h-7 flex-1 overflow-hidden rounded-full">
				<div
					className={cn(
						"h-full rounded-full",
						negative
							? "bg-cost dark:bg-cost-dark"
							: bar.isWinner
								? "bg-earn dark:bg-earn-dark"
								: "bg-earn/35 dark:bg-earn-dark/35",
					)}
					style={{ width: `${pct}%` }}
				/>
			</div>
			<span
				className={cn(
					"w-20 shrink-0 text-right text-[12.5px] font-bold tabular-nums",
					bar.isWinner
						? "text-ink dark:text-ink-dark"
						: "text-muted dark:text-muted-dark",
				)}
			>
				{bar.count > 0 ? formatAmount(bar.value) : "-"}
			</span>
		</div>
	);
};

const BarPanel: FC<{
	bars: Bar[];
	headline: string | null;
	labels: readonly string[];
	title: string;
}> = ({ bars, headline, labels, title }) => {
	const maxAbs = bars.reduce(
		(max, bar) => (bar.count > 0 ? Math.max(max, Math.abs(bar.value)) : max),
		0,
	);

	return (
		<Card>
			<p className="text-label dark:text-label-dark text-[13px] font-bold">
				{title}
			</p>
			{headline ? (
				<p className="font-display text-ink dark:text-ink-dark mt-0.5 text-xl font-extrabold">
					{headline}
				</p>
			) : null}
			<div className="mt-4 flex flex-col gap-2">
				{bars.map((bar) => (
					<BarRow
						key={bar.index}
						bar={bar}
						label={labels[bar.index]}
						maxAbs={maxAbs}
					/>
				))}
			</div>
		</Card>
	);
};

const StatsView: FC<StatsViewProps> = ({ entries, years }) => {
	const [year, setYear] = useState<YearFilter>("all");
	const [metric, setMetric] = useState<StatMetric>("gross");

	const stats = useMemo(
		() => computeStats(entries, year, metric),
		[entries, year, metric],
	);

	const yearsDesc = useMemo(() => [...years].sort((a, b) => b - a), [years]);

	const weekdayWinner = stats.weekdays.find((bar) => bar.isWinner);
	const monthWinner = stats.months.find((bar) => bar.isWinner);

	const recordLabel = stats.record
		? format(parseISO(stats.record.date), "EEEE d 'de' MMMM yyyy", {
				locale: es,
			})
		: null;

	return (
		<div className="flex flex-col gap-4 pb-4">
			{/* Controls: sticky to the top of the scroll container (the content area,
			    which already starts below the fixed appbar) so the selectors stay
			    reachable while scrolling. The -top-2 cancels the scroll container's
			    pt-2 so the bar pins flush under the appbar (8px breathing room at
			    rest, no content peeking through once pinned). z-10 keeps them above
			    the cards' relative bar tracks; the drawer overlay sits at z-10 too
			    (later in the DOM) so it still dims this bar when a drawer opens,
			    below the appbar's z-20. */}
			<div className="xs:-mx-5 xs:px-5 bg-bg dark:bg-bg-dark sticky -top-2 z-10 -mx-4 flex flex-col gap-3 px-4 pt-2 pb-3">
				<div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
					<Pill active={year === "all"} onClick={() => setYear("all")}>
						Todos
					</Pill>
					{yearsDesc.map((y) => (
						<Pill key={y} active={year === y} onClick={() => setYear(y)}>
							{y}
						</Pill>
					))}
				</div>
				<div className="bg-track dark:bg-track-dark flex gap-1 rounded-full p-1">
					{(
						[
							["gross", "Bruto"],
							["net", "Neto"],
						] as const
					).map(([value, label]) => (
						<button
							key={value}
							className={cn(
								"flex-1 rounded-full py-2 text-[13px] font-extrabold transition-colors",
								metric === value
									? "bg-surface dark:bg-badge-dark text-ink dark:text-ink-dark shadow-[0_1px_4px_rgba(58,42,34,0.12)]"
									: "text-label dark:text-label-dark",
							)}
							onClick={() => setMetric(value)}
							type="button"
						>
							{label}
						</button>
					))}
				</div>
			</div>

			{/* Summary */}
			<Card>
				<div className="grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-x-4 gap-y-4">
					<SummaryItem
						label="Ventas"
						value={formatAmount(stats.summary.totalSales)}
					/>
					<SummaryItem
						label="Gastos"
						value={formatAmount(stats.summary.totalExpenses)}
					/>
					<SummaryItem
						label="Balance Total"
						value={formatAmount(stats.summary.net)}
					/>
					<SummaryItem
						label="Días trab."
						value={String(stats.summary.workedDays)}
					/>
					<SummaryItem
						label="Promedio por día"
						value={formatAmount(stats.summary.averagePerWorkedDay)}
					/>
				</div>
			</Card>

			{/* Record */}
			{stats.record && recordLabel ? (
				<Card className="bg-balance text-white dark:bg-[#55402f]">
					<p className="text-[13px] font-bold text-[#d8c2b4]">Tu récord</p>
					<p className="font-display mt-0.5 text-[32px] leading-none font-extrabold text-[#6fe0a8]">
						{formatAmount(stats.record.value)}
					</p>
					<p className="mt-1.5 text-[13px] font-semibold text-[#d8c2b4] first-letter:uppercase">
						{recordLabel}
					</p>
				</Card>
			) : null}

			{/* Weekday */}
			<BarPanel
				bars={stats.weekdays}
				headline={
					weekdayWinner
						? `Tu mejor día es el ${WEEKDAY_LABELS_LONG[weekdayWinner.index]}`
						: null
				}
				labels={WEEKDAY_LABELS_SHORT}
				title="Mejor día de la semana"
			/>

			{/* Month */}
			<BarPanel
				bars={stats.months}
				headline={
					monthWinner
						? `Tu mejor mes es ${MONTH_LABELS_LONG[monthWinner.index]}`
						: null
				}
				labels={MONTH_LABELS_SHORT}
				title="Mejor mes"
			/>
		</div>
	);
};

export default StatsView;
