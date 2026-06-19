"use client";

import { FC, useState } from "react";
import { format } from "date-fns/format";

import { FinancialData, PAYMENT_TYPE_LABELS } from "@/types/balance";
import { cn } from "@/utils/cn";

interface EarnsCostsTabProps {
  data: FinancialData | FinancialData[];
}

const TabPanel = ({
  ariaLabelledBy,
  data,
  isEarnTab,
  isSelected,
}: {
  ariaLabelledBy: string;
  data: FinancialData["earnings" | "expenses"];
  isEarnTab: boolean;
  isSelected: boolean;
}) => (
  <div
    aria-hidden={!isSelected}
    aria-labelledby={ariaLabelledBy}
    className="mt-4 aria-hidden:hidden"
    role="tabpanel"
    tabIndex={0}
  >
    <ul className="grid grid-cols-1 gap-4 pb-12">
      {data.map((entry) => (
        <li key={`${entry.label}-${entry.hour}`} className="flex flex-col">
          <div className="flex justify-between text-xl font-bold">
            <span className="truncate">{entry.label}</span>
            <span
              className={cn(
                "whitespace-nowrap",
                isEarnTab ? "text-earn" : "text-cost",
              )}
            >
              {isEarnTab ? `$ ${entry.value}` : `- $ ${entry.value}`}
            </span>
          </div>
          <div className="flex gap-1 text-sm">
            <span>{PAYMENT_TYPE_LABELS[entry.type]}</span>
            <span>-</span>
            <span>
              {format(new Date(entry.hour), "dd 'de' MMM '-' HH:mm aaa")}
            </span>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

const EarnsCostsTab: FC<EarnsCostsTabProps> = ({ data }) => {
  const [selectedTab, setSelectedTab] = useState(0);

  const earnings: FinancialData["earnings"] = Array.isArray(data)
    ? data.map((entry) => entry.earnings).flat()
    : data.earnings;

  const expenses: FinancialData["expenses"] = Array.isArray(data)
    ? data.map((entry) => entry.expenses).flat()
    : data.expenses;

  return (
    <div>
      <div
        aria-orientation="horizontal"
        className="grid h-10 w-full grid-cols-2 items-center justify-center rounded-md p-1"
        role="tablist"
        tabIndex={0}
      >
        <button
          aria-selected={selectedTab === 0}
          className="flex items-center justify-center border-b border-zinc-300 p-2 font-bold aria-selected:border-zinc-500 dark:border-zinc-500 aria-selected:dark:border-white"
          id="trigger-earnings"
          onClick={() => setSelectedTab(0)}
          role="tab"
        >
          <span className="text-sm">Ingresos</span>
        </button>
        <button
          aria-selected={selectedTab === 1}
          className="flex items-center justify-center border-b border-zinc-300 p-2 font-bold aria-selected:border-zinc-500 dark:border-zinc-500 aria-selected:dark:border-white"
          id="trigger-expenses"
          onClick={() => setSelectedTab(1)}
          role="tab"
        >
          <span className="text-sm">Egresos</span>
        </button>
      </div>

      <TabPanel
        ariaLabelledBy="trigger-earnings"
        data={earnings}
        isSelected={selectedTab === 0}
        isEarnTab
      />

      <TabPanel
        ariaLabelledBy="trigger-expenses"
        data={expenses}
        isEarnTab={false}
        isSelected={selectedTab === 1}
      />
    </div>
  );
};

export default EarnsCostsTab;
