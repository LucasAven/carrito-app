"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { PAYMENT_TYPES, PaymentType } from "@/types/balance";

export interface CreateEntryInput {
  amount: string | number;
  date: string;
  label: string;
  paymentType: string;
}

interface ActionResult {
  error?: string;
}

const parseAmount = (value: string | number): number | null => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
};

const isPaymentType = (value: string): value is PaymentType =>
  (PAYMENT_TYPES as readonly string[]).includes(value);

async function createEntry(
  input: CreateEntryInput,
  kind: "sale" | "expense",
): Promise<ActionResult> {
  if (!input.date) return { error: "Falta la fecha" };
  if (!input.label?.trim()) return { error: "Falta el concepto" };

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
    label: input.label.trim(),
    occurred_on: input.date,
    payment: input.paymentType,
    user_id: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/balance");
  return {};
}

export async function createSale(input: CreateEntryInput): Promise<ActionResult> {
  return createEntry(input, "sale");
}

export async function createExpense(input: CreateEntryInput): Promise<ActionResult> {
  return createEntry(input, "expense");
}
