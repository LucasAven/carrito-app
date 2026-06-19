import { Suspense } from "react";
import { isAfter, isFuture, parse } from "date-fns";
import { redirect } from "next/navigation";

import { Balance } from "@/components/Balance";
import EarnsCostsTab from "@/components/EarnsCostsTab";
import Section from "@/components/section";
import { InternalRoutes, URL_FILTERS } from "@/constants/routes";
import {
  getBalanceFromDate,
  getBalanceFromMonth,
  getBalanceFromWeekRange,
  getFinancialDataByWeekRange,
  getFinancialDataFromDate,
  getFinancialDataFromMonth,
} from "@/lib/api";
import { FinancialData, MonthFilter } from "@/types/balance";
import {
  convertUrlWeekRangeToWeeksDates,
  getFiltersFromSearchParams,
  getFullDateIso,
  getTodaysDate,
  getTwelveMonthsFromNow,
  getYearInWeekRanges,
} from "@/utils";

async function getFinancialDataAndBalance(
  searchParams: URLSearchParams,
): Promise<{
  data: FinancialData | FinancialData[];
  earnings: number;
  expenses: number;
  total: number;
}> {
  const date = searchParams.get(URL_FILTERS.DATE) ?? "";
  const week = searchParams.get(URL_FILTERS.WEEK) ?? "";
  const month = searchParams.get(URL_FILTERS.MONTH) ?? "";
  const filters = getFiltersFromSearchParams(searchParams);

  const weekRange = convertUrlWeekRangeToWeeksDates(week);

  let data, earnings, expenses, total;

  if (date) {
    data = await getFinancialDataFromDate(date, filters);
    ({ earnings, expenses, total } = await getBalanceFromDate(date, filters));
  } else if (week) {
    data = await getFinancialDataByWeekRange(
      weekRange?.weekStart?.toISOString(),
      weekRange?.weekEnd?.toISOString(),
      filters,
    );
    ({ earnings, expenses, total } = await getBalanceFromWeekRange(
      weekRange?.weekStart?.toISOString(),
      weekRange?.weekEnd?.toISOString(),
      filters,
    ));
  } else {
    data = await getFinancialDataFromMonth(month as MonthFilter, filters);
    ({ earnings, expenses, total } = await getBalanceFromMonth(
      month as MonthFilter,
      filters,
    ));
  }

  return { data, earnings, expenses, total };
}

export default async function BalancePage({
  searchParams,
}: {
  searchParams: Promise<{
    date: string;
    month: string;
    week: string;
  }>;
}) {
  const resolvedSearchParams = await searchParams;
  const date = resolvedSearchParams?.date;
  const week = resolvedSearchParams?.week;
  const month = resolvedSearchParams?.month;

  // if the date is not provided or has an invalid format (and there's no week filter set),
  // redirect to the URL with the current date
  if (!date || new Date(date).toString() === "Invalid Date") {
    if (!week && !month) {
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

  const convertedSearchParams = new URLSearchParams(resolvedSearchParams);
  const { data, earnings, expenses, total } = await getFinancialDataAndBalance(
    convertedSearchParams,
  );

  return (
    <Section>
      <div className="flex flex-col gap-5">
        <Suspense fallback={<div>Loading...</div>}>
          <Balance earnings={earnings} expenses={expenses} total={total} />
        </Suspense>
        <Suspense fallback={<div>Loading Earn...</div>}>
          <EarnsCostsTab data={data} />
        </Suspense>
      </div>
    </Section>
  );
}
