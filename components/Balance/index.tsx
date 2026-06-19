"use client";

import type { FC } from "react";

import { cn } from "@/utils/cn";

interface BalanceProps {
	earnings: number;
	expenses: number;
	periodLabel?: string;
	total: number;
}

const formatAmount = (value: number) =>
	new Intl.NumberFormat("es-AR", {
		currency: "ARS",
		maximumFractionDigits: 0,
		style: "currency",
	}).format(value);

export const Balance: FC<BalanceProps> = ({
	earnings,
	expenses,
	periodLabel = "Balance",
	total,
}) => {
	const isPositive = total >= 0;

	return (
		<div className="bg-balance dark:bg-balance-dark relative overflow-hidden rounded-[26px] px-5.5 py-5 text-white">
			<div
				className={cn(
					"absolute -top-8 -right-8 size-32 rounded-full",
					isPositive ? "bg-earn/20" : "bg-brand/20",
				)}
			/>
			<p className="relative text-[13px] font-bold text-[#d8c2b4]">
				{periodLabel}
			</p>
			<p
				className={cn(
					"font-display relative mt-1 text-[46px] leading-[1.02] font-extrabold",
					isPositive ? "text-[#6fe0a8]" : "text-[#ff8a7a]",
				)}
			>
				{formatAmount(total)}
			</p>
			<div className="relative mt-4 flex gap-6">
				<div>
					<p className="text-xs font-extrabold text-[#9fd9be]">▲ Ingresos</p>
					<p className="font-display mt-0.5 text-xl font-bold">
						{formatAmount(earnings)}
					</p>
				</div>
				<div className="w-px bg-white/15" />
				<div>
					<p className="text-xs font-extrabold text-[#f2a99a]">▼ Egresos</p>
					<p className="font-display mt-0.5 text-xl font-bold">
						{formatAmount(expenses)}
					</p>
				</div>
			</div>
		</div>
	);
};
