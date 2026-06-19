"use client";
import { useLayoutEffect, useRef } from "react";
import { CalendarMinus2Icon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { DateTypeDrawer } from "../Drawers";
import { DATE_TYPE_BUTTON, RANGE_PILL } from "./styles";

import { InternalRoutes, URL_FILTERS } from "@/constants/routes";
import { getFiltersFromSearchParams, getYearInWeekRanges } from "@/utils";

export const WeekPicker = () => {
	const carouselRef = useRef<HTMLUListElement>(null);

	const searchParams = useSearchParams();
	const currentFilters = getFiltersFromSearchParams(searchParams);

	const urlWeek = currentFilters.week;
	const weeksRange = getYearInWeekRanges();
	const weeksUrlRange = weeksRange.weekRangesUrlTextFormat;

	useLayoutEffect(() => {
		if (carouselRef.current) {
			const indexSelectedWeek = weeksUrlRange.indexOf(urlWeek);
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
	}, [urlWeek, weeksUrlRange]);

	return (
		<nav className="flex items-center gap-2">
			<ul
				className="no-scrollbar flex flex-1 gap-2 overflow-x-scroll py-1"
				ref={carouselRef}
			>
				{weeksUrlRange.map((weekUrlText, index) => (
					<li
						// biome-ignore lint/suspicious/noArrayIndexKey: index is sufficient here since the list of weeks will never change in length or order
						key={index}
						aria-current={weekUrlText === urlWeek ? "page" : undefined}
						className={RANGE_PILL}
					>
						<Link
							className="block w-full"
							href={{
								pathname: InternalRoutes.balance,
								query: {
									[URL_FILTERS.WEEK]: weekUrlText,
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
							{weeksRange.weekRangesTextFormat[index]}
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
