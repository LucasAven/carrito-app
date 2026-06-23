import { Suspense } from "react";
import { isAfter, isFuture, parse } from "date-fns";
import { redirect } from "next/navigation";

import { Balance } from "@/components/Balance";
import BalanceView from "@/components/BalanceView";
import { EmptyState } from "@/components/EmptyState";
import Section from "@/components/section";
import { InternalRoutes } from "@/constants/routes";
import { getPeriodLabel, loadBalanceEntries } from "@/lib/balance/load";
import {
	getFullDateIso,
	getRecentYears,
	getTodaysDate,
	getTwelveMonthsFromNow,
	getYearInWeekRanges,
} from "@/utils";

export default async function BalancePage({
	searchParams,
}: {
	searchParams: Promise<{
		date: string;
		month: string;
		week: string;
		year: string;
	}>;
}) {
	const resolvedSearchParams = await searchParams;
	const date = resolvedSearchParams?.date;
	const week = resolvedSearchParams?.week;
	const month = resolvedSearchParams?.month;
	const year = resolvedSearchParams?.year;

	// if the date is not provided or has an invalid format (and there's no week,
	// month or year filter set), redirect to the URL with the current date
	if (!date || new Date(date).toString() === "Invalid Date") {
		if (!week && !month && !year) {
			const todayDate = getTodaysDate();
			redirect(`${InternalRoutes.balance}?date=${todayDate}`);
		}
	}

	if (date) {
		// if the date is not in the correct format, redirect to the URL with the correct one
		// i.e. ?date=2024-3-20 =>  ?date=2024-03-20
		// i.e. ?date=2024-03- =>  ?date=2024-03-01
		if (getFullDateIso(date) !== date) {
			redirect(`${InternalRoutes.balance}?date=${getFullDateIso(date)}`);
		}
		// if date is in the future, redirect to the URL with the current date
		if (isFuture(new Date(date))) {
			const todayDate = getTodaysDate();
			redirect(`${InternalRoutes.balance}?date=${todayDate}`);
		}
	}

	if (week) {
		const weekRanges = getYearInWeekRanges();
		const currentWeekRangeIndex = weekRanges.weekRangesUrlTextFormat.findIndex(
			(weekRange) => weekRange === week,
		);

		if (!week.includes("_") || week.length < 11) {
			redirect(
				`${InternalRoutes.balance}?week=${weekRanges.weekRangesUrlTextFormat.at(-1)}`,
			);
		}

		if (currentWeekRangeIndex === -1) {
			redirect(
				`${InternalRoutes.balance}?week=${weekRanges.weekRangesUrlTextFormat.at(-1)}`,
			);
		} else {
			const weekStartDate =
				weekRanges.weekRangesDateFormat[currentWeekRangeIndex].weekStart;
			const weekEndDate =
				weekRanges.weekRangesDateFormat[currentWeekRangeIndex].weekEnd;
			const isWeekStartPosteriorToWeekEnd = isAfter(weekStartDate, weekEndDate);

			if (isFuture(weekStartDate) || isWeekStartPosteriorToWeekEnd) {
				redirect(
					`${InternalRoutes.balance}?week=${weekRanges.weekRangesUrlTextFormat.at(-1)}`,
				);
			}
		}
	}

	if (month && (!month.includes("-") || month.length < 8)) {
		const monthParsed = parse(month, "yyyy-MM", new Date());
		const months = getTwelveMonthsFromNow();
		const isMonthInvalid = monthParsed.toString() === "Invalid Date";

		if (isFuture(monthParsed) || !months.includes(month) || isMonthInvalid) {
			redirect(`${InternalRoutes.balance}?month=${months.at(-1)}`);
		}
	}

	if (year) {
		const years = getRecentYears();
		// reject anything outside the selectable window (also covers future years)
		if (!years.includes(year)) {
			redirect(`${InternalRoutes.balance}?year=${years.at(-1)}`);
		}
	}

	const convertedSearchParams = new URLSearchParams(resolvedSearchParams);
	const { earnings, entries, expenses, total } = await loadBalanceEntries(
		convertedSearchParams,
	);

	const periodLabel = getPeriodLabel({ date, month, week, year });

	return (
		<Section className="flex min-h-0 flex-1 flex-col">
			<div className="flex min-h-0 flex-1 flex-col gap-4">
				{entries.length === 0 ? (
					<>
						<Suspense fallback={null}>
							<Balance
								earnings={earnings}
								expenses={expenses}
								periodLabel={periodLabel}
								total={total}
							/>
						</Suspense>
						<EmptyState
							accent="brand"
							description="Registrá tu primera venta o gasto para verlo acá."
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
									<path d="M5 3.5l1.6 1.4L8.2 3.5l1.6 1.4 1.6-1.4 1.6 1.4 1.6-1.4 1.6 1.4L19 3.5V20l-1.6-1.4-1.6 1.4-1.6-1.4-1.6 1.4-1.6-1.4-1.6 1.4L6.6 18.6 5 20z" />
									<line x1="8" x2="16" y1="9" y2="9" />
									<line x1="8" x2="14" y1="13" y2="13" />
								</svg>
							}
							title="Todavía no hay movimientos"
						/>
					</>
				) : (
					<Suspense fallback={null}>
						<BalanceView entries={entries} periodLabel={periodLabel} />
					</Suspense>
				)}
			</div>
		</Section>
	);
}
