"use client";

import { useSearchParams } from "next/navigation";

import { DayPicker } from "./DayPicker";
import { MonthPicker } from "./MonthPicker";
import { RangePicker } from "./RangePicker";
import { WeekPicker } from "./WeekPicker";
import { YearPicker } from "./YearPicker";

import { URL_FILTERS } from "@/constants/routes";

export const DatePicker = () => {
  const searchParams = useSearchParams();
  const date = searchParams.get(URL_FILTERS.DATE);
  const week = searchParams.get(URL_FILTERS.WEEK);
  const month = searchParams.get(URL_FILTERS.MONTH);
  const year = searchParams.get(URL_FILTERS.YEAR);
  const range = searchParams.get(URL_FILTERS.RANGE);

  return (
    <>
      {date && !week && !month && !year && !range ? <DayPicker /> : null}
      {week && !date && !month && !year && !range ? <WeekPicker /> : null}
      {month && !date && !week && !year && !range ? <MonthPicker /> : null}
      {year && !date && !week && !month && !range ? <YearPicker /> : null}
      {range && !date && !week && !month && !year ? <RangePicker /> : null}
    </>
  );
};
