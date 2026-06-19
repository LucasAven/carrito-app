"use client";
import { useLayoutEffect, useRef } from "react";
import { CalendarMinus2Icon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { DateTypeDrawer, JumpToDateDrawer } from "../Drawers";
import { DATE_TYPE_BUTTON, DAY_PILL } from "./styles";

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
		<nav className="flex items-center gap-2">
			<ul
				className="no-scrollbar flex flex-1 gap-2 overflow-x-scroll py-1"
				ref={carouselRef}
			>
				{currentDateAndRange.map(({ date, day, month }, index) => {
					const isSelected = isSameDate(urlDate, date);
					const label = `${day} ${month}`;

					if (isSelected) {
						return (
							// biome-ignore lint/suspicious/noArrayIndexKey: index is sufficient here since the list of days will never change in length or order
							<li key={index} aria-current="page" className={DAY_PILL}>
								<JumpToDateDrawer currentDate={urlDate}>
									<button className="w-full" type="button">
										{label}
									</button>
								</JumpToDateDrawer>
							</li>
						);
					}

					return (
						// biome-ignore lint/suspicious/noArrayIndexKey: index is sufficient here since the list of days will never change in length or order
						<li key={index} className={DAY_PILL}>
							<Link
								className="block w-full"
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
