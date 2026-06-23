import type { Entry } from "@/lib/db/entries";
import { PAYMENT_TYPE_LABELS } from "@/types/balance";

// Spanish header, in the Operator's own domain terms (see CONTEXT.md). One row
// per Entry, chronological. The amount is left as a raw two-decimal number with
// a dot separator so a spreadsheet treats it as a number, not text; the Tipo
// column carries the sign meaning (Venta is money in, Gasto is money out).
const HEADER = ["Fecha", "Tipo", "Concepto", "Forma de pago", "Monto"];

// RFC-4180 escaping: wrap in quotes and double any embedded quote whenever the
// field holds a comma, quote or newline. Concepto is Operator free-text, so it
// is the field that actually needs this.
function escapeCell(value: string): string {
	if (/[",\n\r]/.test(value)) {
		return `"${value.replace(/"/g, '""')}"`;
	}
	return value;
}

function toRow(cells: string[]): string {
	return cells.map(escapeCell).join(",");
}

/**
 * Serializes entries to an RFC-4180 CSV string (no BOM, the caller prepends one
 * when building the download Blob so spreadsheets read the accents correctly).
 * @example
 * entriesToCsv(entries)
 * //=> "Fecha,Tipo,Concepto,Forma de pago,Monto\n2026-06-01,Venta,Cafe,Efectivo,3500.00"
 */
export function entriesToCsv(entries: Entry[]): string {
	const lines = [toRow(HEADER)];

	for (const entry of entries) {
		lines.push(
			toRow([
				entry.occurred_on,
				entry.kind === "sale" ? "Venta" : "Gasto",
				entry.label,
				PAYMENT_TYPE_LABELS[entry.payment],
				entry.amount.toFixed(2),
			]),
		);
	}

	return lines.join("\n");
}
