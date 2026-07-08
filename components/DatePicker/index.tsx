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
      {/* The bare /balance URL (no scope params) is the "today" ledger, so the
          day carousel is also the default picker; DayPicker itself falls back
          to today when the date param is absent. */}
      {!week && !month && !year && !range ? <DayPicker /> : null}
      {week && !date && !month && !year && !range ? <WeekPicker /> : null}
      {month && !date && !week && !year && !range ? <MonthPicker /> : null}
      {year && !date && !week && !month && !range ? <YearPicker /> : null}
      {range && !date && !week && !month && !year ? <RangePicker /> : null}
    </>
  );
};
