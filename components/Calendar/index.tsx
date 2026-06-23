/* eslint-disable sort-keys */
/* eslint-disable react/jsx-sort-props */
"use client";

import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/utils/cn";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function CalendarIconLeft() {
	return <ChevronLeft className="h-4 w-4" />;
}

function CalendarIconRight() {
	return <ChevronRight className="h-4 w-4" />;
}

function Calendar({
	className,
	classNames,
	showOutsideDays = true,
	...props
}: CalendarProps) {
	return (
		<DayPicker
			showOutsideDays={showOutsideDays}
			className={cn("px-3", className)}
			classNames={{
				months:
					"flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 justify-center",
				month: "space-y-4",
				caption: "flex justify-center pt-1 relative items-center",
				caption_label:
					"font-display text-lg font-bold text-ink dark:text-ink-dark",
				nav: "flex items-center",
				nav_button:
					"flex size-9 items-center justify-center rounded-[13px] bg-track dark:bg-track-dark text-muted dark:text-muted-dark p-0",
				nav_button_previous: "absolute left-1",
				nav_button_next: "absolute right-1",
				table: "w-full border-collapse space-y-1",
				head_row: "flex",
				head_cell:
					"grow text-xs font-extrabold text-muted dark:text-muted-dark",
				row: "flex w-full mt-2",
				day: "rounded-full h-10 w-10 p-0 font-display font-bold text-ink dark:text-ink-dark hover:bg-track dark:bg-track-dark",
				day_selected:
					"bg-amber text-white shadow-[0_3px_8px_rgba(245,165,36,0.4)]",
				// Range mode (RangeDrawer): the two ends read as filled amber
				// circles, the days between as a lighter amber fill.
				day_range_start:
					"!bg-amber text-white shadow-[0_3px_8px_rgba(245,165,36,0.4)]",
				day_range_end:
					"!bg-amber text-white shadow-[0_3px_8px_rgba(245,165,36,0.4)]",
				day_range_middle:
					"!bg-amber/15 !text-ink dark:!text-ink-dark !shadow-none",
				day_today:
					"!bg-brand text-white shadow-[0_4px_10px_rgba(224,97,62,0.42)]",
				day_outside: "text-disabled dark:text-disabled-dark font-semibold",
				day_disabled: "text-disabled dark:text-disabled-dark opacity-60",
				day_hidden: "invisible",
				...classNames,
			}}
			components={{
				IconLeft: CalendarIconLeft,
				IconRight: CalendarIconRight,
			}}
			{...props}
		/>
	);
}
Calendar.displayName = "Calendar";

export { Calendar };
