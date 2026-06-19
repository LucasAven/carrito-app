"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { DrawerBase } from "./DrawerBase";

import { URL_FILTERS } from "@/constants/routes";
import {
  BalanceFilters,
  PAYMENT_TYPE_LABELS,
  PAYMENT_TYPES,
  PaymentType,
} from "@/types/balance";
import { getFiltersFromSearchParams } from "@/utils";

export function FilterDrawer({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<BalanceFilters>(() =>
    getFiltersFromSearchParams(searchParams),
  );

  const isApplyDisabled = selectedFilters?.paymentTypes.length === 0;

  const addFilter = (paymentType: PaymentType) => {
    setSelectedFilters((prev) => {
      if (prev.paymentTypes.includes(paymentType)) {
        return {
          ...prev,
          paymentTypes: prev.paymentTypes.filter(
            (type) => type !== paymentType,
          ),
        };
      }
      return { ...prev, paymentTypes: [...prev.paymentTypes, paymentType] };
    });
  };

  useEffect(() => {
    // If the drawer is closed and the searchParams change, keep the filter in sync with the URL
    if (!openDrawer)
      setSelectedFilters(getFiltersFromSearchParams(searchParams));
  }, [searchParams, openDrawer]);

  return (
    <DrawerBase
      open={openDrawer}
      setOpen={setOpenDrawer}
      title="Filtros"
      triggerButton={children}
    >
      <div className="mx-auto flex max-w-md flex-wrap gap-3 xs:justify-center">
        {PAYMENT_TYPES.map((type) => (
          <div key={type} className="flex items-center">
            <input
              checked={selectedFilters?.paymentTypes.includes(type)}
              className="peer hidden"
              id={type}
              onChange={() => addFilter(type)}
              type="checkbox"
            />
            <label
              className="cursor-pointer rounded-lg border-2 border-transparent border-zinc-200 bg-white p-3 text-gray-500 shadow peer-checked:border-zinc-800 peer-checked:bg-indigo-300 peer-checked:text-black peer-checked:shadow-2xl dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:peer-checked:border-zinc-300 dark:peer-checked:bg-indigo-600 dark:peer-checked:text-white"
              htmlFor={type}
              onKeyDown={(e) =>
                e.key === "Enter" || e.key === " " ? addFilter(type) : null
              }
              tabIndex={0}
            >
              {PAYMENT_TYPE_LABELS[type]}
            </label>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-6 flex max-w-lg items-center justify-between">
        <Link
          className="font-semibold text-indigo-400"
          href={{
            pathname,
            query: {
              ...(selectedFilters.date
                ? { [URL_FILTERS.DATE]: selectedFilters.date }
                : {}),
              ...(selectedFilters.week ? { week: selectedFilters.week } : {}),
              ...(selectedFilters.month
                ? { [URL_FILTERS.MONTH]: selectedFilters.month }
                : {}),
              ...(selectedFilters.label
                ? { [URL_FILTERS.LABEL]: selectedFilters.label }
                : {}),
            },
          }}
          onClick={() => {
            setSelectedFilters((prev) => ({
              ...prev,
              paymentTypes: [],
            }));
            setOpenDrawer(false);
          }}
        >
          Limpiar
        </Link>
        <Link
          aria-disabled={isApplyDisabled}
          className="rounded-3xl border border-gray-300 bg-green-300 p-2 px-5 font-medium shadow aria-disabled:bg-green-50 dark:border-gray-700 dark:bg-green-600 dark:aria-disabled:bg-green-900 dark:aria-disabled:text-zinc-400"
          href={
            isApplyDisabled
              ? "#"
              : {
                  pathname,
                  query: {
                    [URL_FILTERS.PAYMENT_TYPE]:
                      selectedFilters?.paymentTypes.join(","),
                    ...(selectedFilters.date
                      ? { [URL_FILTERS.DATE]: selectedFilters.date }
                      : {}),
                    ...(selectedFilters.week
                      ? { week: selectedFilters.week }
                      : {}),
                    ...(selectedFilters.month
                      ? { [URL_FILTERS.MONTH]: selectedFilters.month }
                      : {}),
                    ...(selectedFilters.label
                      ? { [URL_FILTERS.LABEL]: selectedFilters.label }
                      : {}),
                  },
                }
          }
          onClick={() => !isApplyDisabled && setOpenDrawer(false)}
          tabIndex={isApplyDisabled ? -1 : undefined}
        >
          Aplicar
        </Link>
      </div>
    </DrawerBase>
  );
}
