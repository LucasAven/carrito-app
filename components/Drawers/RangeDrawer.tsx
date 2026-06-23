"use client";

import { type ReactNode, useState } from "react";
import type { DateRange } from "react-day-picker";
import { useRouter, useSearchParams } from "next/navigation";

import { DrawerBase } from "./DrawerBase";

import { Calendar } from "@/components/Calendar";
import { InternalRoutes, URL_FILTERS } from "@/constants/routes";
import {
	getFiltersFromSearchParams,
	getFullDateIso,
	parseRangeUrl,
} from "@/utils";

interface RangeDrawerProps {
	children: ReactNode;
	// The active range, encoded "from_to", used to seed the calendar.
	currentRange?: string;
}

const toDate = (iso: string) => new Date(`${iso}T00:00:00`);

export function RangeDrawer({ children, currentRange }: RangeDrawerProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [open, setOpen] = useState(false);

	const parsed = currentRange ? parseRangeUrl(currentRange) : null;
	const [selected, setSelected] = useState<DateRange | undefined>(
		parsed ? { from: toDate(parsed.from), to: toDate(parsed.to) } : undefined,
	);

	const canApply = Boolean(selected?.from && selected?.to);

	const onApply = () => {
		if (!selected?.from || !selected?.to) return;

		const filters = getFiltersFromSearchParams(searchParams);
		const range = `${getFullDateIso(selected.from)}_${getFullDateIso(selected.to)}`;

		const query = new URLSearchParams({ [URL_FILTERS.RANGE]: range });
		// Carry payment/label filters across the period change, matching the
		// week/month pickers.
		if (filters.paymentTypes.length) {
			query.set(URL_FILTERS.PAYMENT_TYPE, filters.paymentTypes.join(","));
		}
		if (filters.label) query.set(URL_FILTERS.LABEL, filters.label);

		setOpen(false);
		router.push(`${InternalRoutes.balance}?${query.toString()}`);
	};

	return (
		<DrawerBase
			open={open}
			setOpen={setOpen}
			subtitle="Elegí el primer y el último día"
			title="Período personalizado"
			triggerButton={children}
		>
			<div className="flex flex-col items-center gap-4">
				<Calendar
					disabled={{ after: new Date() }}
					mode="range"
					onSelect={setSelected}
					selected={selected}
				/>
				<button
					aria-disabled={!canApply}
					className="bg-earn font-display w-full rounded-[14px] py-3.5 text-base font-bold text-white shadow-[0_6px_16px_rgba(31,157,107,0.32)] aria-disabled:opacity-50"
					disabled={!canApply}
					onClick={onApply}
					type="button"
				>
					Aplicar
				</button>
			</div>
		</DrawerBase>
	);
}
