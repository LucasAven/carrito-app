"use client";

import { FC } from "react";

interface BalanceProps {
  earnings: number;
  expenses: number;
  total: number;
}

export const Balance: FC<BalanceProps> = ({ earnings, expenses, total }) => {
  return (
    <div className="rounded-3xl border-2 border-zinc-300 py-4 dark:border-white">
      <div className="flex justify-between px-5">
        <h2>Balance:</h2>
        <p>$ {total}</p>
      </div>
      <hr className="my-4 border border-zinc-300" />
      <div className="flex justify-between">
        <div className="mx-auto flex flex-col text-center">
          <h3 className="text-earn text-sm font-bold">Ingresos</h3>
          <p>$ {earnings}</p>
        </div>
        <hr className="-mb-4 -mt-4 h-auto border border-zinc-300" />
        <div className="mx-auto flex flex-col text-center">
          <h3 className="text-cost text-sm font-bold">Egresos</h3>
          <p>$ {expenses}</p>
        </div>
      </div>
    </div>
  );
};
