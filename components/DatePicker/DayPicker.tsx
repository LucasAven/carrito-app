"use client";
import { useLayoutEffect, useRef } from "react";
import { CalendarMinus2Icon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { DateTypeDrawer, JumpToDateDrawer } from "../Drawers";

import { InternalRoutes, URL_FILTERS } from "@/constants/routes";
import {
  getDateAndPreviousDays,
  getFiltersFromSearchParams,
  isSameDate,
} from "@/utils";

export const DayPicker = () => {
  const carouselRef = useRef<HTMLUListElement>(null);

  const searchParams = useSearchParams();
  const currentFilters = getFiltersFromSearchParams(searchParams);

  const urlDate = currentFilters.date;
  const currentDateAndRange = getDateAndPreviousDays(urlDate, true);

  useLayoutEffect(() => {
    if (carouselRef.current) {
      const indexSelectedDate = currentDateAndRange.findIndex((dayInfo) =>
        isSameDate(dayInfo.date, urlDate),
      );
      const selectedElement = carouselRef.current.children[
        indexSelectedDate
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
  }, [urlDate, currentDateAndRange]);

  return (
    <nav className="flex">
      <ul
        className="no-scrollbar flex gap-2 overflow-x-scroll py-1 pr-1"
        ref={carouselRef}
      >
        {currentDateAndRange.map(({ date, day, month }, index) => {
          const isSelected = isSameDate(urlDate, date);
          const label = `${day} ${month}`;

          if (isSelected) {
            return (
              <li
                key={index}
                aria-current="page"
                className="w-16 shrink-0 whitespace-nowrap rounded py-2 text-center aria-current:bg-indigo-300"
              >
                <JumpToDateDrawer currentDate={urlDate}>
                  <button className="w-full" type="button">
                    {label}
                  </button>
                </JumpToDateDrawer>
              </li>
            );
          }

          return (
            <li
              key={index}
              className="w-16 shrink-0 whitespace-nowrap rounded py-2 text-center"
            >
              <Link
                href={{
                  pathname: InternalRoutes.balance,
                  query: {
                    [URL_FILTERS.DATE]: date,
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
                {label}
              </Link>
            </li>
          );
        })}
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
