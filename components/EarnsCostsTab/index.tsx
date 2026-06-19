"use client";

import { FC, useState } from "react";
import { format } from "date-fns/format";

import { Entry } from "@/lib/db/entries";
import { PAYMENT_TYPE_LABELS } from "@/types/balance";
import { cn } from "@/utils/cn";

interface EarnsCostsTabProps {
  entries: Entry[];
}

const formatAmount = (value: number) =>
  new Intl.NumberFormat("es-AR", {
    currency: "ARS",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);

const TabPanel = ({
  ariaLabelledBy,
  entries,
  isEarnTab,
  isSelected,
}: {
  ariaLabelledBy: string;
  entries: Entry[];
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
      {entries.map((entry) => (
        <li key={entry.id} className="flex flex-col">
          <div className="flex justify-between text-xl font-bold">
            <span className="truncate">{entry.label}</span>
            <span
              className={cn(
                "whitespace-nowrap",
                isEarnTab ? "text-earn" : "text-cost",
              )}
            >
              {isEarnTab ? formatAmount(entry.amount) : `- ${formatAmount(entry.amount)}`}
            </span>
          </div>
          <div className="flex gap-1 text-sm">
            <span>{PAYMENT_TYPE_LABELS[entry.payment]}</span>
            <span>-</span>
            <span>{format(new Date(entry.occurred_on), "dd 'de' MMM")}</span>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

const EarnsCostsTab: FC<EarnsCostsTabProps> = ({ entries }) => {
  const [selectedTab, setSelectedTab] = useState(0);

  const earnings = entries.filter((entry) => entry.kind === "sale");
  const expenses = entries.filter((entry) => entry.kind === "expense");

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
        entries={earnings}
        isSelected={selectedTab === 0}
        isEarnTab
      />

      <TabPanel
        ariaLabelledBy="trigger-expenses"
        entries={expenses}
        isEarnTab={false}
        isSelected={selectedTab === 1}
      />
    </div>
  );
};

export default EarnsCostsTab;
