"use client";

import { type ReactNode, useState } from "react";
import { CheckIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { DrawerBase } from "./DrawerBase";

import { InternalRoutes, URL_FILTERS } from "@/constants/routes";
import {
	getRecentYears,
	getTodaysDate,
	getTwelveMonthsFromNow,
	getYearInWeekRanges,
} from "@/utils";
import { cn } from "@/utils/cn";

export function DateTypeDrawer({ children }: { children: ReactNode }) {
	const [openDrawer, setOpenDrawer] = useState(false);
	const searchParams = useSearchParams();

	const activeType = searchParams.get(URL_FILTERS.WEEK)
		? "week"
		: searchParams.get(URL_FILTERS.MONTH)
			? "month"
			: searchParams.get(URL_FILTERS.YEAR)
				? "year"
				: "date";

	const options = [
		{
			key: "date" as const,
			label: "Hoy",
			query: { [URL_FILTERS.DATE]: getTodaysDate() },
		},
		{
			key: "week" as const,
			label: "Esta semana",
			query: {
				[URL_FILTERS.WEEK]:
					getYearInWeekRanges().weekRangesUrlTextFormat.at(-1),
			},
		},
		{
			key: "month" as const,
			label: "Este mes",
			query: { [URL_FILTERS.MONTH]: getTwelveMonthsFromNow().at(-1) },
		},
		{
			key: "year" as const,
			label: "Este año",
			query: { [URL_FILTERS.YEAR]: getRecentYears().at(-1) },
		},
	];

	return (
		<DrawerBase
			open={openDrawer}
			setOpen={setOpenDrawer}
			subtitle="¿Qué querés ver?"
			title="Período"
			triggerButton={children}
		>
			<div className="flex flex-col gap-2.5 pt-1">
				{options.map(({ key, label, query }) => {
					const isActive = key === activeType;
					return (
						<Link
							key={key}
							className={cn(
								"font-display flex items-center justify-between rounded-2xl px-4.5 py-4 text-lg font-bold",
								isActive
									? "bg-amber text-white shadow-[0_5px_14px_rgba(245,165,36,0.34)]"
									: "bg-surface dark:bg-surface-dark text-ink dark:text-ink-dark shadow-[0_1px_4px_rgba(58,42,34,0.05)]",
							)}
							href={{ pathname: InternalRoutes.balance, query }}
							onClick={() => setOpenDrawer(false)}
						>
							<span>{label}</span>
							{isActive ? <CheckIcon className="stroke-3" size={20} /> : null}
						</Link>
					);
				})}
			</div>
		</DrawerBase>
	);
}
