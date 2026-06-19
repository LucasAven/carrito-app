"use client";
import { useLayoutEffect, useRef } from "react";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarMinus2Icon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { DateTypeDrawer } from "../Drawers";
import { DATE_TYPE_BUTTON, RANGE_PILL } from "./styles";

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
		<nav className="flex items-center gap-2">
			<ul
				className="no-scrollbar flex flex-1 gap-2 overflow-x-scroll py-1"
				ref={carouselRef}
			>
				{months.map((month, index) => (
					<li
						// biome-ignore lint/suspicious/noArrayIndexKey: index is sufficient here since the list of months will never change in length or order
						key={index}
						aria-current={month === urlMonth ? "page" : undefined}
						className={RANGE_PILL}
					>
						<Link
							className="block w-full"
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
			<DateTypeDrawer>
				<button
					aria-label="Cambiar período"
					className={DATE_TYPE_BUTTON}
					type="button"
				>
					<CalendarMinus2Icon size={19} />
				</button>
			</DateTypeDrawer>
		</nav>
	);
};
