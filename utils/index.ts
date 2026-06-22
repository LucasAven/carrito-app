import {
  addDays,
  differenceInDays,
  eachMonthOfInterval,
  eachWeekOfInterval,
  endOfToday,
  endOfWeek,
  format,
  getDate,
  isBefore,
  isEqual,
  isSameDay,
  parse,
  startOfMonth,
  startOfToday,
  subDays,
} from "date-fns";

import { URL_FILTERS } from "@/constants/routes";
import {
  BalanceFilters,
  MonthFilter,
  PAYMENT_TYPES,
  PaymentType,
} from "@/types/balance";

/**
 * Converts the date into ISO format
 * @returns The date in ISO format as a string
 * @example
 * getFullDateIso(new Date())
 * //=> "2022-01-03"
 */
export const getFullDateIso = (date: string | Date) => {
  // Date objects represent a local instant: format locally so we don't roll
  // into the next day via UTC conversion (e.g. late night in UTC-3).
  if (date instanceof Date) return format(date, "yyyy-MM-dd");
  // Date-only strings (yyyy-MM-dd) are already in the shape we want.
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  // Fallback for full ISO timestamps.
  return format(new Date(date), "yyyy-MM-dd");
};

/**
 * Get the current date ISO formatted in a string
 * (it's a wrapper for `getFullDateIso(new Date()`)
 * @returns The current date in ISO format as a string
 * @example
 * getTodaysDate()
 * //=> "2022-01-03"
 */
export const getTodaysDate = () => getFullDateIso(new Date());

/**
 * Get the week ranges of the current year
 * @returns An array of formatted week ranges
 * @example
 * getYearInWeekRanges()
 * //=> ["03 Jan - 09 Jan", "10 Jan - 16 Jan", "17 Jan - 23 Jan", "24 Jan - 30 Jan"]
 */
export function getYearInWeekRanges(): {
  // eslint-disable-next-line typescript-sort-keys/interface
  weekRangesDateFormat: { weekStart: Date; weekEnd: Date }[];
  weekRangesTextFormat: string[];
  weekRangesUrlTextFormat: string[];
} {
  // get first day of the current year
  const firstDayOfMonth = new Date(new Date().getFullYear(), 0, 1);

  // Get all weeks of the month
  const weeks = eachWeekOfInterval(
    // eslint-disable-next-line sort-keys
    { start: firstDayOfMonth, end: getTodaysDate() },
    { weekStartsOn: 1 }, // Configure week to start on Monday
  );

  // eslint-disable-next-line typescript-sort-keys/interface
  const weekRanges: { weekStart: Date; weekEnd: Date }[] = [];

  // Generate formatted week ranges
  const weekRangesText = weeks.map((weekStart) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

    // eslint-disable-next-line sort-keys
    weekRanges.push({ weekStart, weekEnd });

    return `${format(weekStart, "dd MMM")} - ${format(weekEnd, "dd MMM")}`;
  });

  // Generate formatted week ranges for URL
  const weekRangesUrlText = weekRangesText.map((weekRange) =>
    convertWeekRangeTextToUrlWeekRange(weekRange),
  );

  return {
    weekRangesDateFormat: weekRanges,
    weekRangesTextFormat: weekRangesText,
    weekRangesUrlTextFormat: weekRangesUrlText,
  };
}

/**
 * Convert a week range text into a week range format for URLs
 * @param weekRange - The week range text to convert
 * @returns The date range in the format "MM-dd_MM-dd"
 * @example
 * convertWeekRangeTextToUrlWeekRange("03 Jan - 09 Jan")
 * //=> "01-03_01-09"
 **/
export const convertWeekRangeTextToUrlWeekRange = (
  weekRange: string,
): string => {
  // Split the range into start and end parts
  const [startPart, endPart] = weekRange.split(" - ");

  const year = new Date().getFullYear();

  // Define the base format for parsing
  const baseFormat = "dd MMM";

  // Parse the start and end dates
  const startDate = parse(
    `${startPart} ${year}`,
    `${baseFormat} yyyy`,
    new Date(),
  );
  const endDate = parse(`${endPart} ${year}`, `${baseFormat} yyyy`, new Date());

  // Format the dates into the desired output format
  const startFormat = format(startDate, "MM-dd");
  const endFormat = format(endDate, "MM-dd");

  // Return the combined new format
  return `${startFormat}_${endFormat}`;
};

export const convertUrlWeekRangeToWeeksDates = (urlWeekRange: string) => {
  // eslint-disable-next-line sort-keys
  if (!urlWeekRange) return { weekStart: new Date(), weekEnd: new Date() };

  const [start, end] = urlWeekRange.split("_");

  const year = new Date().getFullYear();

  const weekStart = parse(`${start} ${year}`, "MM-dd yyyy", new Date());
  const weekEnd = parse(`${end} ${year}`, "MM-dd yyyy", new Date());

  // eslint-disable-next-line sort-keys
  return { weekStart, weekEnd };
};

/**
 * Get the months of the last year and the current year
 * @returns An array of month names
 * @example
 * getTwelveMonthsFromNow()
 * //=> ["Jan-2021", "Feb-2021", "Mar-2021", "Apr-2021", "May-2021", "Jun-2021", "Jul-2021", "Aug-2021", "Sep-2021", "Oct-2021", "Nov-2021", "Dec-2021"]
 * */
export const getTwelveMonthsFromNow = () => {
  const today = new Date().toISOString();
  const lastYearMonth = new Date(
    new Date().setFullYear(new Date().getFullYear() - 1),
  ).toISOString();
  const months = eachMonthOfInterval({
    end: today,
    start: lastYearMonth,
  });

  return months.map((month) => format(month, "MMM-yyyy").toLowerCase());
};

/**
 * Get a window of recent years (current year and the previous `yearsBack`),
 * oldest first, as 4-digit strings.
 * @returns An array of year strings
 * @example
 * getRecentYears()
 * //=> ["2022", "2023", "2024", "2025", "2026"]
 * */
export const getRecentYears = (yearsBack = 4) => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: yearsBack + 1 }, (_, index) =>
    String(currentYear - yearsBack + index),
  );
};

/**
 * Get the date and the previous days of the month
 * @param selectedDate - The selected date
 * @param addExtraDaysFromPreviousMonth - Whether to add extra days from the previous month
 * @returns - An array of objects with the date (ISO Format), day(Date format), and month (string format like "Jan")
 * @example
 * getDateAndPreviousDays("2022-01-03")
 * //=> [{ date: "2022-01-01", day: 1, month: "Jan" }, { date: "2022-01-02", day: 2, month: "Jan" }, { date: "2022-01-03", day: 3, month: "Jan" }]
 */
export const getDateAndPreviousDays = (
  selectedDate: string,
  addExtraDaysFromPreviousMonth = false,
) => {
  const formatString = "yyyy-MM-dd";
  const parsedDate = parse(selectedDate, formatString, new Date());

  let startDate = startOfMonth(parsedDate);

  if (addExtraDaysFromPreviousMonth) {
    const today = startOfToday();
    const daysPassedInCurrentMonth = differenceInDays(today, startDate) + 1;

    // Calculate extra days from the previous month
    const extraDaysFromPreviousMonth = 31 - daysPassedInCurrentMonth;
    startDate = subDays(startDate, extraDaysFromPreviousMonth);
  }

  const today = endOfToday();
  const dates = [];

  for (
    let date = startDate;
    isBefore(date, today) || isSameDay(date, today);
    date = addDays(date, 1)
  ) {
    dates.push({
      date: getFullDateIso(date),
      day: getDate(date),
      month: format(date, "MMM"),
    });
  }

  return dates;
};

export const isSameDate = (date1: string | Date, date2: string | Date) =>
  isEqual(getFullDateIso(date1), getFullDateIso(date2));

export const getFiltersFromSearchParams = (
  searchParams: URLSearchParams,
): BalanceFilters => {
  const paymentFilters = searchParams
    .get(URL_FILTERS.PAYMENT_TYPE)
    ?.split(",")
    ?.filter((f) => PAYMENT_TYPES.includes(f as PaymentType)) as PaymentType[];

  const labelFilter = searchParams.get(URL_FILTERS.LABEL);

  const date = searchParams.get(URL_FILTERS.DATE);

  const week = searchParams.get(URL_FILTERS.WEEK);

  const month = searchParams.get(URL_FILTERS.MONTH);

  const year = searchParams.get(URL_FILTERS.YEAR);

  if (!date && week) {
    return {
      date: "",
      label: labelFilter ?? "",
      month: "",
      paymentTypes: paymentFilters ?? [],
      week,
      year: "",
    };
  }

  if (!date && !week && month) {
    return {
      date: "",
      label: labelFilter ?? "",
      month: month as MonthFilter,
      paymentTypes: paymentFilters ?? [],
      week: "",
      year: "",
    };
  }

  if (!date && !week && !month && year) {
    return {
      date: "",
      label: labelFilter ?? "",
      month: "",
      paymentTypes: paymentFilters ?? [],
      week: "",
      year,
    };
  }

  // if there's no week/month/year filter, return the date filter (or today's date)
  return {
    date: date ?? getTodaysDate(),
    label: labelFilter ?? "",
    month: "",
    paymentTypes: paymentFilters ?? [],
    week: "",
    year: "",
  };
};
