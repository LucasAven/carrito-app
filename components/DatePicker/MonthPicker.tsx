"use client";
import { useLayoutEffect, useRef } from "react";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarMinus2Icon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { DateTypeDrawer } from "../Drawers";

import { InternalRoutes, URL_FILTERS } from "@/constants/routes";
import { getFiltersFromSearchParams, getTwelveMonthsFromNow } from "@/utils";

export const MonthPicker = () => {
  const carouselRef = useRef<HTMLUListElement>(null);

  const searchParams = useSearchParams();
  const currentFilters = getFiltersFromSearchParams(searchParams);

  const urlMonth = currentFilters.month;
  const months = getTwelveMonthsFromNow();

  useLayoutEffect(() => {
    if (carouselRef.current) {
      const indexSelectedWeek = months.findIndex((month) => month === urlMonth);
      const selectedElement = carouselRef.current.children[
        indexSelectedWeek
      ] as HTMLLIElement;

      if (selectedElement) {
        // target position of selected date
        const targetPos =
          selectedElement.offsetLeft +
          selectedElement.offsetWidth -
          carouselRef.current.offsetWidth -
          12;

        carouselRef.current.scrollLeft = targetPos;
      }
    }
  }, [urlMonth, months]);

  return (
    <nav className="flex">
      <ul
        className="no-scrollbar flex gap-2 overflow-x-scroll py-1 pr-1"
        ref={carouselRef}
      >
        {months.map((month, index) => (
          <li
            key={index}
            aria-current={month === urlMonth ? "page" : undefined}
            className="w-32 shrink-0 whitespace-nowrap rounded py-2 text-center capitalize aria-current:bg-indigo-300"
          >
            <Link
              href={{
                pathname: InternalRoutes.balance,
                query: {
                  [URL_FILTERS.MONTH]: month,
                  ...(currentFilters.paymentTypes.length
                    ? {
                        [URL_FILTERS.PAYMENT_TYPE]:
                          currentFilters?.paymentTypes.join(","),
                      }
                    : {}),
                  ...(currentFilters.label
                    ? { [URL_FILTERS.LABEL]: currentFilters.label }
                    : {}),
                },
              }}
            >
              {format(parse(month, "MMM-yyyy", new Date()), "MMMM", {
                locale: es,
              })}
            </Link>
          </li>
        ))}
      </ul>
      <hr className="h-auto border border-zinc-500 dark:border-zinc-300" />
      <DateTypeDrawer>
        <CalendarMinus2Icon
          className="ml-2 flex-shrink-0 self-center"
          size={24}
        />
      </DateTypeDrawer>
    </nav>
  );
};
