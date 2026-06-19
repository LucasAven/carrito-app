import { isSameMonth, isWithinInterval, parse, parseISO } from "date-fns";

import { BalanceFilters, FinancialData, MonthFilter } from "@/types/balance";
import { getEarnings, getExpenses, getFullDateIso, getTotal } from "@/utils";
import { filterData } from "@/utils/filtering";

export const getFinancialData = async () => {
  const response = await fetch(
    "http://localhost:3000/mock_financial_data.json",
  );
  const data = await response.json();
  return data;
};

export const getFinancialDataFromDate = async (
  date: string,
  filters: BalanceFilters,
): Promise<FinancialData> => {
  if (!date) {
    return {
      date: "",
      earnings: [],
      expenses: [],
    };
  }

  const data = (await getFinancialData()) as FinancialData[];
  const parsedDate = getFullDateIso(new Date(date).toISOString());
  const finalData = data.find(
    (entry) => getFullDateIso(entry.date) === parsedDate,
  ) ?? {
    date: parsedDate,
    earnings: [],
    expenses: [],
  };

  const filteredData = filterData({ data: finalData, filters });

  return filteredData;
};

export const getFinancialDataByWeekRange = async (
  startDate: string,
  endDate: string,
  filters: BalanceFilters,
): Promise<FinancialData[]> => {
  if (!startDate || !endDate) return [];

  const data = (await getFinancialData()) as FinancialData[];
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  // Filter data entries that fall within the week range
  const weekData = data.filter((entry) =>
    // eslint-disable-next-line sort-keys
    isWithinInterval(parseISO(entry.date), { start, end }),
  );

  const weekDataWithFiltersApplied = weekData.map((entry) =>
    filterData({
      data: entry,
      filters,
      sort: false,
    }),
  );

  return weekDataWithFiltersApplied;
};

export const getBalanceFromDate = async (
  date: string,
  filters: BalanceFilters,
) => {
  const dateData = await getFinancialDataFromDate(date, filters);
  const earnings = getEarnings(dateData);
  const expenses = getExpenses(dateData);
  const total = getTotal(earnings, expenses);

  return { earnings, expenses, total };
};

export const getBalanceFromWeekRange = async (
  startDate: string,
  endDate: string,
  filters: BalanceFilters,
) => {
  const weekData = await getFinancialDataByWeekRange(
    startDate,
    endDate,
    filters,
  );

  const earnings = weekData.reduce((acc, entry) => acc + getEarnings(entry), 0);
  const expenses = weekData.reduce((acc, entry) => acc + getExpenses(entry), 0);
  const total = getTotal(earnings, expenses);

  return { earnings, expenses, total };
};

export const getFinancialDataFromMonth = async (
  month: MonthFilter,
  filters: BalanceFilters,
) => {
  const data = (await getFinancialData()) as FinancialData[];

  const parsedMonth = parse(month, "MMM-yyyy", new Date()).toISOString();

  const monthData = data.filter((entry) =>
    isSameMonth(entry.date, parsedMonth),
  );

  const filteredMonthData = monthData.map((entry) =>
    filterData({ data: entry, filters }),
  );
  return filteredMonthData;
};

export const getBalanceFromMonth = async (
  month: MonthFilter,
  filters: BalanceFilters,
) => {
  const monthData = await getFinancialDataFromMonth(month, filters);

  const earnings = monthData.reduce(
    (acc, entry) => acc + getEarnings(entry),
    0,
  );
  const expenses = monthData.reduce(
    (acc, entry) => acc + getExpenses(entry),
    0,
  );
  const total = getTotal(earnings, expenses);

  return { earnings, expenses, total };
};
