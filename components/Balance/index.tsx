"use client";

import type { FC } from "react";
import { DownloadIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { cn } from "@/utils/cn";

interface BalanceProps {
	earnings: number;
	expenses: number;
	periodLabel?: string;
	// Surfaces the "Exportar" pill in the card header. Off in the empty state,
	// where there's nothing to hand the accountant.
	showExport?: boolean;
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
	showExport = false,
	total,
}) => {
	const isPositive = total >= 0;
	const searchParams = useSearchParams();

	// Carry the active scope (date/week/month/year + filters) to the export
	// report, so "Exportar" hands the accountant exactly what's on screen.
	const exportQuery = searchParams.toString();
	const exportHref = exportQuery ? `/exportar?${exportQuery}` : "/exportar";

	return (
		<div className="bg-balance dark:bg-balance-dark relative shrink-0 overflow-hidden rounded-[26px] px-5.5 py-5 text-white">
			<div
				className={cn(
					"absolute -top-8 -right-8 size-32 rounded-full",
					isPositive ? "bg-earn/20" : "bg-brand/20",
				)}
			/>
			<div className="relative flex items-start justify-between gap-3">
				<p className="text-[13px] font-bold text-[#d8c2b4]">{periodLabel}</p>
				{showExport ? (
					<Link
						aria-label="Exportar"
						className="-mt-1 -mr-1 flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-2 text-[13px] font-extrabold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
						href={exportHref}
					>
						<DownloadIcon size={16} />
						Exportar
					</Link>
				) : null}
			</div>
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
