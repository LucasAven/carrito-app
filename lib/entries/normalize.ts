import { format, isValid, parse } from "date-fns";

import {
	ENTRY_KINDS,
	type EntryKind,
	PAYMENT_TYPES,
	type PaymentType,
} from "@/types/balance";

// Boundary rules shared by every write path (server actions and the Shortcut
// route handler). Keeping them in one place stops the two paths from drifting.

export const parseAmount = (value: string | number): number | null => {
	const n = typeof value === "number" ? value : Number(value);
	if (!Number.isFinite(n) || n < 0) return null;
	return n;
};

// Siri dictation hands us free text where "," groups thousands and "." is the
// decimal separator, often with noise: "161,000", "1,500.50", "$161,000",
// "161000 pesos". It also dictates a spoken decimal as the word "con" ("ciento
// sesenta y un mil cuatrocientos cincuenta con treinta y siete" -> "161,450 con
// 37"), so fold that into a decimal point first. Then strip everything but
// digits and separators, drop the thousands commas, keep the decimal dot, and
// validate. Keeps a plain number (or clean numeric string) working unchanged.
export const parseSpokenAmount = (value: string | number): number | null => {
	if (typeof value === "number") return parseAmount(value);
	if (typeof value !== "string") return null;

	const withSpokenDecimal = value.replace(/\bcon\b/gi, ".");
	const digitsAndSeparators = withSpokenDecimal.replace(/[^\d.,]/g, "");
	if (!digitsAndSeparators) return null;

	const normalized = digitsAndSeparators.replace(/,/g, "");
	return parseAmount(normalized);
};

export const isPaymentType = (value: string): value is PaymentType =>
	(PAYMENT_TYPES as readonly string[]).includes(value);

export const isEntryKind = (value: string): value is EntryKind =>
	(ENTRY_KINDS as readonly string[]).includes(value);

// InputDate writes either a "dd/MM/yyyy" string (calendar picker) or a Date
// (typed input). Postgres `date` wants YYYY-MM-DD. Normalize at the boundary.
export const toIsoDate = (value: Date | string): string | null => {
	if (value instanceof Date) {
		return isValid(value) ? format(value, "yyyy-MM-dd") : null;
	}
	if (typeof value !== "string" || !value) return null;
	if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
	const parsed = parse(value, "dd/MM/yyyy", new Date());
	return isValid(parsed) ? format(parsed, "yyyy-MM-dd") : null;
};

// A blank concept defaults to the kind's noun ("Venta" / "Gasto").
export const labelForKind = (
	label: string | null | undefined,
	kind: EntryKind,
): string => {
	const trimmed = label?.trim();
	return trimmed || (kind === "sale" ? "Venta" : "Gasto");
};
