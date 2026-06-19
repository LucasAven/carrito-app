"use client";

import { type ReactNode, useEffect, useState } from "react";
import { CreditCardIcon, WalletIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { DrawerBase } from "./DrawerBase";

import { URL_FILTERS } from "@/constants/routes";
import {
	type BalanceFilters,
	PAYMENT_TYPE_LABELS,
	PAYMENT_TYPES,
	type PaymentType,
} from "@/types/balance";
import { getFiltersFromSearchParams } from "@/utils";

const PAYMENT_TYPE_ICONS: Record<PaymentType, ReactNode> = {
	cash: <WalletIcon size={22} />,
	mercado_pago: <CreditCardIcon size={22} />,
};

export function FilterDrawer({ children }: { children: ReactNode }) {
	const searchParams = useSearchParams();
	const pathname = usePathname();

	const [openDrawer, setOpenDrawer] = useState(false);
	const [selectedFilters, setSelectedFilters] = useState<BalanceFilters>(() =>
		getFiltersFromSearchParams(searchParams),
	);

	const isApplyDisabled = selectedFilters?.paymentTypes.length === 0;

	const addFilter = (paymentType: PaymentType) => {
		setSelectedFilters((prev) => {
			if (prev.paymentTypes.includes(paymentType)) {
				return {
					...prev,
					paymentTypes: prev.paymentTypes.filter(
						(type) => type !== paymentType,
					),
				};
			}
			return { ...prev, paymentTypes: [...prev.paymentTypes, paymentType] };
		});
	};

	useEffect(() => {
		// If the drawer is closed and the searchParams change, keep the filter in sync with the URL
		if (!openDrawer)
			setSelectedFilters(getFiltersFromSearchParams(searchParams));
	}, [searchParams, openDrawer]);

	return (
		<DrawerBase
			open={openDrawer}
			setOpen={setOpenDrawer}
			subtitle="Forma de pago"
			title="Filtros"
			triggerButton={children}
		>
			<div className="grid grid-cols-2 gap-3 pt-1">
				{PAYMENT_TYPES.map((type) => (
					<label key={type} className="cursor-pointer" htmlFor={type}>
						<input
							checked={selectedFilters?.paymentTypes.includes(type)}
							className="peer sr-only"
							id={type}
							onChange={() => addFilter(type)}
							type="checkbox"
						/>
						<span className="border-line dark:border-line-dark bg-surface dark:bg-surface-dark text-muted dark:text-muted-dark peer-checked:bg-brand flex flex-col items-center gap-2 rounded-2xl border-2 px-3 py-4.5 text-center text-[15px] font-extrabold peer-checked:border-transparent peer-checked:text-white peer-checked:shadow-[0_5px_14px_rgba(224,97,62,0.3)]">
							{PAYMENT_TYPE_ICONS[type]}
							{PAYMENT_TYPE_LABELS[type]}
						</span>
					</label>
				))}
			</div>
			<div className="mt-6 flex items-center justify-between">
				<Link
					className="text-muted dark:text-muted-dark px-1 py-3 text-[15px] font-extrabold"
					href={{
						pathname,
						query: {
							...(selectedFilters.date
								? { [URL_FILTERS.DATE]: selectedFilters.date }
								: {}),
							...(selectedFilters.week ? { week: selectedFilters.week } : {}),
							...(selectedFilters.month
								? { [URL_FILTERS.MONTH]: selectedFilters.month }
								: {}),
							...(selectedFilters.label
								? { [URL_FILTERS.LABEL]: selectedFilters.label }
								: {}),
						},
					}}
					onClick={() => {
						setSelectedFilters((prev) => ({
							...prev,
							paymentTypes: [],
						}));
						setOpenDrawer(false);
					}}
				>
					Limpiar
				</Link>
				<Link
					aria-disabled={isApplyDisabled}
					className="bg-earn font-display rounded-[14px] px-10 py-3.5 text-base font-bold text-white shadow-[0_6px_16px_rgba(31,157,107,0.32)] aria-disabled:opacity-50"
					href={
						isApplyDisabled
							? "#"
							: {
									pathname,
									query: {
										[URL_FILTERS.PAYMENT_TYPE]:
											selectedFilters?.paymentTypes.join(","),
										...(selectedFilters.date
											? { [URL_FILTERS.DATE]: selectedFilters.date }
											: {}),
										...(selectedFilters.week
											? { week: selectedFilters.week }
											: {}),
										...(selectedFilters.month
											? { [URL_FILTERS.MONTH]: selectedFilters.month }
											: {}),
										...(selectedFilters.label
											? { [URL_FILTERS.LABEL]: selectedFilters.label }
											: {}),
									},
								}
					}
					onClick={() => !isApplyDisabled && setOpenDrawer(false)}
					tabIndex={isApplyDisabled ? -1 : undefined}
				>
					Aplicar
				</Link>
			</div>
		</DrawerBase>
	);
}
