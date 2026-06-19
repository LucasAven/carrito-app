"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";

import { DrawerBase } from "./DrawerBase";

import { InternalRoutes, URL_FILTERS } from "@/constants/routes";
import {
  getTodaysDate,
  getTwelveMonthsFromNow,
  getYearInWeekRanges,
} from "@/utils";

export function DateTypeDrawer({ children }: { children: ReactNode }) {
  const [openDrawer, setOpenDrawer] = useState(false);

  return (
    <DrawerBase
      open={openDrawer}
      setOpen={setOpenDrawer}
      triggerButton={children}
    >
      <div className="mx-auto flex max-w-md flex-col gap-3 xs:justify-center">
        <Link
          href={{
            pathname: InternalRoutes.balance,
            query: {
              [URL_FILTERS.DATE]: getTodaysDate(),
            },
          }}
          onClick={() => setOpenDrawer(false)}
        >
          Hoy
        </Link>
        <Link
          href={{
            pathname: InternalRoutes.balance,
            query: {
              [URL_FILTERS.WEEK]:
                getYearInWeekRanges().weekRangesUrlTextFormat.at(-1),
            },
          }}
          onClick={() => setOpenDrawer(false)}
        >
          Semana
        </Link>
        <Link
          href={{
            pathname: InternalRoutes.balance,
            query: {
              [URL_FILTERS.MONTH]: getTwelveMonthsFromNow().at(-1),
            },
          }}
        >
          Mes
        </Link>
        {/* TODO: add custom */}
        {/* <Link>Personalizado</Link> */}
      </div>
    </DrawerBase>
  );
}
