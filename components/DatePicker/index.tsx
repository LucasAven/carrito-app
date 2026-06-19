"use client";

import { useSearchParams } from "next/navigation";

import { DayPicker } from "./DayPicker";
import { MonthPicker } from "./MonthPicker";
import { WeekPicker } from "./WeekPicker";

import { URL_FILTERS } from "@/constants/routes";

export const DatePicker = () => {
  const searchParams = useSearchParams();
  const date = searchParams.get(URL_FILTERS.DATE);
  const week = searchParams.get(URL_FILTERS.WEEK);
  const month = searchParams.get(URL_FILTERS.MONTH);

  return (
    <>
      {date && !week && !month ? <DayPicker /> : null}
      {week && !date && !month ? <WeekPicker /> : null}
      {month && !date && !week ? <MonthPicker /> : null}
    </>
  );
};
