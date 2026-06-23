"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarMinus2Icon, CalendarRangeIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { DateTypeDrawer, RangeDrawer } from "../Drawers";
import { DATE_TYPE_BUTTON } from "./styles";

import { getFiltersFromSearchParams, parseRangeUrl } from "@/utils";

const shortDay = (iso: string) =>
	format(new Date(`${iso}T00:00:00`), "d MMM", { locale: es });

export const RangePicker = () => {
	const searchParams = useSearchParams();
	const { range } = getFiltersFromSearchParams(searchParams);
	const parsed = parseRangeUrl(range);

	const label = parsed
		? `${shortDay(parsed.from)} - ${shortDay(parsed.to)}`
		: "Personalizado";

	return (
		<nav className="flex items-center gap-2">
			{/* Unlike the bounded week/month/year carousels, a custom range has no
			    list to scroll: the single active span is a pill that reopens the
			    calendar to adjust either end. */}
			<RangeDrawer currentRange={range}>
				<button
					className="bg-amber font-display flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-sm font-extrabold text-white capitalize shadow-[0_3px_8px_rgba(245,165,36,0.4)]"
					type="button"
				>
					<CalendarRangeIcon size={17} />
					{label}
				</button>
			</RangeDrawer>
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
