"use client";

import { type FC, useState } from "react";
import { format } from "date-fns/format";
import { es } from "date-fns/locale";
import { ArrowLeftIcon, FileSpreadsheetIcon, PrinterIcon } from "lucide-react";
import Link from "next/link";

import { showToast } from "@/components/Toast";
import type { Entry } from "@/lib/db/entries";
import { entriesToCsv } from "@/lib/export/csv";
import { PAYMENT_TYPE_LABELS } from "@/types/balance";
import { cn } from "@/utils/cn";

interface ExportViewProps {
	backHref: string;
	baseName: string;
	earnings: number;
	entries: Entry[];
	expenses: number;
	generatedOn: string;
	periodLabel: string;
	total: number;
}

const formatAmount = (value: number) =>
	new Intl.NumberFormat("es-AR", {
		currency: "ARS",
		maximumFractionDigits: 0,
		style: "currency",
	}).format(value);

// Triggers the browser's native share sheet when the platform supports sharing
// files (iOS PWA, Android), otherwise downloads the file. A dismissed share
// sheet stops here rather than falling through to a surprise download.
async function shareOrDownload(file: File): Promise<void> {
	const nav = navigator as Navigator & {
		canShare?: (data: { files: File[] }) => boolean;
	};

	if (nav.canShare?.({ files: [file] }) && nav.share) {
		try {
			await nav.share({ files: [file], title: file.name });
			return;
		} catch (error) {
			// The Operator dismissing the share sheet is not a failure: stop here
			// instead of falling through to a surprise download.
			if (error instanceof DOMException && error.name === "AbortError") return;
		}
	}

	const url = URL.createObjectURL(file);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = file.name;
	document.body.appendChild(anchor);
	anchor.click();
	anchor.remove();
	URL.revokeObjectURL(url);
}

const ExportView: FC<ExportViewProps> = ({
	backHref,
	baseName,
	earnings,
	entries,
	expenses,
	generatedOn,
	periodLabel,
	total,
}) => {
	const [busy, setBusy] = useState(false);
	const isEmpty = entries.length === 0;

	const handleCsv = async () => {
		if (isEmpty || busy) return;
		setBusy(true);
		try {
			// The leading BOM makes Excel read the UTF-8 accents (Café, José)
			// correctly.
			const bom = String.fromCharCode(0xfeff);
			const blob = new Blob([bom + entriesToCsv(entries)], {
				type: "text/csv;charset=utf-8;",
			});
			await shareOrDownload(
				new File([blob], `${baseName}.csv`, { type: "text/csv" }),
			);
		} catch {
			showToast({ message: "No se pudo exportar el CSV" });
		} finally {
			setBusy(false);
		}
	};

	// PDF without a library: the print stylesheet (globals.css) strips the app
	// chrome and the toolbar, leaving just the report, which the Operator saves
	// as PDF or shares from the system print dialog.
	const handlePdf = () => {
		if (isEmpty) return;
		window.print();
	};

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-4">
			<div className="no-print flex items-center gap-2">
				<Link
					aria-label="Volver"
					className="bg-surface dark:bg-surface-dark text-muted dark:text-muted-dark flex size-9.5 shrink-0 items-center justify-center rounded-full shadow-[0_2px_7px_rgba(58,42,34,0.1)]"
					href={backHref}
				>
					<ArrowLeftIcon size={20} />
				</Link>
				<div className="flex flex-1 gap-2">
					<button
						className="bg-earn font-display flex flex-1 items-center justify-center gap-2 rounded-[14px] px-3 py-3 text-[15px] font-extrabold text-white shadow-[0_6px_16px_rgba(31,157,107,0.3)] disabled:opacity-50"
						disabled={isEmpty || busy}
						onClick={handleCsv}
						type="button"
					>
						<FileSpreadsheetIcon size={18} />
						CSV
					</button>
					<button
						className="bg-brand font-display flex flex-1 items-center justify-center gap-2 rounded-[14px] px-3 py-3 text-[15px] font-extrabold text-white shadow-[0_6px_16px_rgba(224,97,62,0.3)] disabled:opacity-50"
						disabled={isEmpty}
						onClick={handlePdf}
						type="button"
					>
						<PrinterIcon size={18} />
						PDF
					</button>
				</div>
			</div>

			<div className="no-scrollbar min-h-0 flex-1 overflow-y-auto pb-4">
				{/* The report renders in fixed light colors (not theme tokens) so the
				    printed page is always dark-ink-on-white, and so the on-screen
				    preview reads as the document it becomes. */}
				{/** biome-ignore lint/correctness/useUniqueElementIds: unique id */}
				<div
					className="print-report mx-auto max-w-2xl rounded-[20px] border border-[#e7d6c8] bg-white p-4 text-ink shadow-[0_2px_12px_rgba(58,42,34,0.08)] sm:p-6"
					id="export-report"
				>
					<div className="flex items-start justify-between gap-2 border-b border-[#eadbce] pb-4 sm:gap-3">
						<div className="min-w-0">
							<p className="font-display text-xl font-extrabold sm:text-2xl">
								Mi Negocio
							</p>
							<p className="mt-0.5 text-[13px] font-bold text-muted sm:text-sm">
								{periodLabel}
							</p>
						</div>
						<p className="shrink-0 text-right text-[11px] font-semibold text-muted sm:text-xs">
							Generado el
							<br />
							{generatedOn}
						</p>
					</div>

					<div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
						<div className="rounded-2xl bg-[#f1f9f5] px-2.5 py-2.5 sm:px-3 sm:py-3">
							<p className="text-[10px] font-extrabold tracking-wide text-earn sm:text-[11px]">
								INGRESOS
							</p>
							<p className="font-display mt-0.5 text-sm font-bold whitespace-nowrap tabular-nums sm:text-lg">
								{formatAmount(earnings)}
							</p>
						</div>
						<div className="rounded-2xl bg-[#fdf0ec] px-2.5 py-2.5 sm:px-3 sm:py-3">
							<p className="text-[10px] font-extrabold tracking-wide text-cost sm:text-[11px]">
								EGRESOS
							</p>
							<p className="font-display mt-0.5 text-sm font-bold whitespace-nowrap tabular-nums sm:text-lg">
								{formatAmount(expenses)}
							</p>
						</div>
						<div className="rounded-2xl bg-badge px-2.5 py-2.5 sm:px-3 sm:py-3">
							<p className="text-[10px] font-extrabold tracking-wide text-label sm:text-[11px]">
								NETO
							</p>
							<p
								className={cn(
									"font-display mt-0.5 text-sm font-bold whitespace-nowrap tabular-nums sm:text-lg",
									total >= 0 ? "text-earn" : "text-cost",
								)}
							>
								{formatAmount(total)}
							</p>
						</div>
					</div>

					{isEmpty ? (
						<p className="mt-6 text-center text-sm font-semibold text-muted">
							No hay movimientos para exportar en este período.
						</p>
					) : (
						<table className="mt-5 w-full border-collapse text-left text-[13px] sm:text-sm">
							<thead>
								<tr className="border-b border-[#eadbce] text-[10px] font-extrabold tracking-wide text-muted sm:text-[11px]">
									<th className="py-2 pr-1.5 font-extrabold sm:pr-2">FECHA</th>
									<th className="py-2 pr-1.5 font-extrabold sm:pr-2">
										CONCEPTO
									</th>
									<th className="py-2 pr-1.5 font-extrabold sm:pr-2">PAGO</th>
									<th className="py-2 text-right font-extrabold">MONTO</th>
								</tr>
							</thead>
							<tbody>
								{entries.map((entry) => {
									const isSale = entry.kind === "sale";
									return (
										<tr
											key={entry.id}
											className="border-b border-badge align-top"
										>
											<td className="py-2 pr-1.5 whitespace-nowrap tabular-nums sm:pr-2">
												{format(
													new Date(`${entry.occurred_on}T00:00:00`),
													"dd MMM yy",
													{ locale: es },
												)}
											</td>
											<td className="py-2 pr-1.5 font-bold wrap-break-word sm:pr-2">
												{entry.label}
											</td>
											<td className="py-2 pr-1.5 text-muted sm:pr-2">
												{PAYMENT_TYPE_LABELS[entry.payment]}
											</td>
											<td
												className={cn(
													"py-2 text-right font-bold whitespace-nowrap tabular-nums",
													isSale ? "text-earn" : "text-cost",
												)}
											>
												{isSale
													? formatAmount(entry.amount)
													: `-${formatAmount(entry.amount)}`}
											</td>
										</tr>
									);
								})}
							</tbody>
							<tfoot>
								<tr className="border-t-2 border-[#3a2a22] font-extrabold">
									<td className="py-2.5 pr-1.5 sm:pr-2" colSpan={3}>
										Neto ({entries.length}{" "}
										{entries.length === 1 ? "movimiento" : "movimientos"})
									</td>
									<td
										className={cn(
											"py-2.5 text-right whitespace-nowrap tabular-nums",
											total >= 0 ? "text-earn" : "text-cost",
										)}
									>
										{formatAmount(total)}
									</td>
								</tr>
							</tfoot>
						</table>
					)}
				</div>
			</div>
		</div>
	);
};

export default ExportView;
