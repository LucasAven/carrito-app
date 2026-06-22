"use client";
import { useLayoutEffect, useRef } from "react";
import { CalendarMinus2Icon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { DateTypeDrawer } from "../Drawers";
import { DATE_TYPE_BUTTON, RANGE_PILL } from "./styles";

import { InternalRoutes, URL_FILTERS } from "@/constants/routes";
import { getFiltersFromSearchParams, getRecentYears } from "@/utils";

export const YearPicker = () => {
	const carouselRef = useRef<HTMLUListElement>(null);

	const searchParams = useSearchParams();
	const currentFilters = getFiltersFromSearchParams(searchParams);

	const urlYear = currentFilters.year;
	const years = getRecentYears();

	useLayoutEffect(() => {
		if (carouselRef.current) {
			const indexSelectedYear = years.findIndex((year) => year === urlYear);
			const selectedElement = carouselRef.current.children[
				indexSelectedYear
			] as HTMLLIElement;

			if (selectedElement) {
				// target position of selected year
				const targetPos =
					selectedElement.offsetLeft +
					selectedElement.offsetWidth -
					carouselRef.current.offsetWidth -
					12;

				carouselRef.current.scrollLeft = targetPos;
			}
		}
	}, [urlYear, years]);

	return (
		<nav className="flex items-center gap-2">
			<ul
				className="no-scrollbar flex flex-1 gap-2 overflow-x-scroll py-1"
				ref={carouselRef}
			>
				{years.map((year, index) => (
					<li
						// biome-ignore lint/suspicious/noArrayIndexKey: index is sufficient here since the list of years will never change in length or order
						key={index}
						aria-current={year === urlYear ? "page" : undefined}
						className={RANGE_PILL}
					>
						<Link
							className="block w-full"
							href={{
								pathname: InternalRoutes.balance,
								query: {
									[URL_FILTERS.YEAR]: year,
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
							{year}
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
