"use client";

import { useSearchParams } from "next/navigation";

import { DayPicker } from "./DayPicker";
import { MonthPicker } from "./MonthPicker";
import { WeekPicker } from "./WeekPicker";
import { YearPicker } from "./YearPicker";

import { URL_FILTERS } from "@/constants/routes";

export const DatePicker = () => {
  const searchParams = useSearchParams();
  const date = searchParams.get(URL_FILTERS.DATE);
  const week = searchParams.get(URL_FILTERS.WEEK);
  const month = searchParams.get(URL_FILTERS.MONTH);
  const year = searchParams.get(URL_FILTERS.YEAR);

  return (
    <>
      {date && !week && !month && !year ? <DayPicker /> : null}
      {week && !date && !month && !year ? <WeekPicker /> : null}
      {month && !date && !week && !year ? <MonthPicker /> : null}
      {year && !date && !week && !month ? <YearPicker /> : null}
    </>
  );
};
