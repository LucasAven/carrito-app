"use server";

import { revalidatePath } from "next/cache";

import {
	isPaymentType,
	labelForKind,
	parseAmount,
	toIsoDate,
} from "@/lib/entries/normalize";
import { createClient } from "@/lib/supabase/server";
import type { EntryKind } from "@/types/balance";

export interface CreateEntryInput {
	amount: string | number;
	date: Date | string;
	label: string;
	paymentType: string;
}

interface ActionResult {
	error?: string;
}

async function createEntry(
	input: CreateEntryInput,
	kind: EntryKind,
): Promise<ActionResult> {
	const occurredOn = toIsoDate(input.date);
	if (!occurredOn) return { error: "Falta la fecha" };

	const label = labelForKind(input.label, kind);

	const amount = parseAmount(input.amount);
	if (amount === null) return { error: "Monto inválido" };

	if (!isPaymentType(input.paymentType)) {
		return { error: "Forma de pago inválida" };
	}

	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return { error: "Sesión expirada" };

	const { error } = await supabase.from("entries").insert({
		amount,
		kind,
		label,
		occurred_on: occurredOn,
		payment: input.paymentType,
		user_id: user.id,
	});

	if (error) return { error: error.message };

	revalidatePath("/balance");
	return {};
}

export async function createSale(
	input: CreateEntryInput,
): Promise<ActionResult> {
	return createEntry(input, "sale");
}

export async function createExpense(
	input: CreateEntryInput,
): Promise<ActionResult> {
	return createEntry(input, "expense");
}

export interface UpdateEntryInput {
	amount: string | number;
	date: Date | string;
	label: string;
	paymentType: string;
}

export async function updateEntry(
	id: string,
	patch: UpdateEntryInput,
): Promise<ActionResult> {
	if (!id) return { error: "Falta el id" };
	const occurredOn = toIsoDate(patch.date);
	if (!occurredOn) return { error: "Falta la fecha" };
	if (!patch.label?.trim()) return { error: "Falta el concepto" };

	const amount = parseAmount(patch.amount);
	if (amount === null) return { error: "Monto inválido" };

	if (!isPaymentType(patch.paymentType)) {
		return { error: "Forma de pago inválida" };
	}

	const supabase = await createClient();
	const { error } = await supabase
		.from("entries")
		.update({
			amount,
			label: patch.label.trim(),
			occurred_on: occurredOn,
			payment: patch.paymentType,
		})
		.eq("id", id);

	if (error) return { error: error.message };

	revalidatePath("/balance");
	return {};
}

export async function deleteEntry(id: string): Promise<ActionResult> {
	if (!id) return { error: "Falta el id" };

	const supabase = await createClient();
	const { error } = await supabase
		.from("entries")
		.update({ deleted_at: new Date().toISOString() })
		.eq("id", id);

	if (error) return { error: error.message };

	revalidatePath("/balance");
	return {};
}
