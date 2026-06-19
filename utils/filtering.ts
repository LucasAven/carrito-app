import { compareAsc } from "date-fns/compareAsc";
import { isWithinInterval } from "date-fns/isWithinInterval";
import { parseISO } from "date-fns/parseISO";

import { convertUrlWeekRangeToWeeksDates } from ".";

import { BalanceFilters, FinancialData, PaymentType } from "@/types/balance";

const filterByWeekRange = ({
  data,
  weekEnd,
  weekStart,
}: {
  data: FinancialData;
  weekEnd: Date;
  weekStart: Date;
}): FinancialData => {
  const filteredEarningsByWeekRange = data.earnings.filter((entry) =>
    isWithinInterval(parseISO(entry.hour), {
      end: weekEnd,
      start: weekStart,
    }),
  );
  const filteredExpensesByWeekRange = data.expenses.filter((entry) =>
    isWithinInterval(parseISO(entry.hour), {
      end: weekEnd,
      start: weekStart,
    }),
  );

  return {
    date: data.date,
    earnings: filteredEarningsByWeekRange,
    expenses: filteredExpensesByWeekRange,
  };
};

const filterByLabel = ({
  data,
  label,
}: {
  data: FinancialData;
  label: string;
}): FinancialData => {
  const filteredEarningsByLabel = data.earnings.filter((entry) =>
    entry.label.toLowerCase().includes(label.toLowerCase()),
  );
  const filteredExpensesByLabel = data.expenses.filter((entry) =>
    entry.label.toLowerCase().includes(label.toLowerCase()),
  );

  return {
    date: data.date,
    earnings: filteredEarningsByLabel,
    expenses: filteredExpensesByLabel,
  };
};

const filterByPaymentType = ({
  data,
  paymentTypes,
}: {
  data: FinancialData;
  paymentTypes: PaymentType[];
}): FinancialData => {
  const filteredEarningsByPaymentType = data.earnings.filter((entry) =>
    paymentTypes.includes(entry.type),
  );
  const filteredExpensesByPaymentType = data.expenses.filter((entry) =>
    paymentTypes.includes(entry.type),
  );

  return {
    date: data.date,
    earnings: filteredEarningsByPaymentType,
    expenses: filteredExpensesByPaymentType,
  };
};

export const filterData = ({
  data,
  filters,
  sort = true,
}: {
  data: FinancialData;
  filters: BalanceFilters;
  sort?: boolean;
}) => {
  // Filter data by week
  const weekRange = convertUrlWeekRangeToWeeksDates(filters.week);
  const filteredDataByWeekRange = filters.week
    ? filterByWeekRange({
        data,
        weekEnd: weekRange.weekEnd,
        weekStart: weekRange.weekStart,
      })
    : data;

  // Filter data by label
  const filteredDataByLabel = filters.label
    ? filterByLabel({ data: filteredDataByWeekRange, label: filters.label })
    : filteredDataByWeekRange;

  // Filter data by payment type
  const filteredData = filters.paymentTypes.length
    ? filterByPaymentType({
        data: filteredDataByLabel,
        paymentTypes: filters.paymentTypes,
      })
    : filteredDataByLabel;

  // Sort filtered data by hour
  if (sort) {
    filteredData.earnings.sort((a, b) =>
      compareAsc(new Date(a.hour), new Date(b.hour)),
    );
    filteredData.expenses.sort((a, b) =>
      compareAsc(new Date(a.hour), new Date(b.hour)),
    );
  }

  return filteredData;
};
