"use client";

import { type ReactNode, useState } from "react";
import { useRouter } from "next/navigation";

import { DrawerBase } from "./DrawerBase";

import { Calendar } from "@/components/Calendar";
import { InternalRoutes, URL_FILTERS } from "@/constants/routes";
import { getFullDateIso } from "@/utils";

interface JumpToDateDrawerProps {
	children: ReactNode;
	currentDate?: string;
}

export function JumpToDateDrawer({
	children,
	currentDate,
}: JumpToDateDrawerProps) {
	const router = useRouter();
	const [open, setOpen] = useState(false);

	const selected = currentDate
		? new Date(`${currentDate}T00:00:00`)
		: undefined;

	const onSelect = (date: Date | undefined) => {
		if (!date) return;
		const iso = getFullDateIso(date);
		setOpen(false);
		router.push(`${InternalRoutes.balance}?${URL_FILTERS.DATE}=${iso}`);
	};

	return (
		<DrawerBase
			open={open}
			setOpen={setOpen}
			title="Ir a fecha"
			triggerButton={children}
		>
			<div className="flex justify-center">
				<Calendar
					disabled={{ after: new Date() }}
					mode="single"
					onSelect={onSelect}
					selected={selected}
				/>
			</div>
		</DrawerBase>
	);
}
