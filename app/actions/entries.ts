"use server";

import { format, isValid, parse } from "date-fns";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { PAYMENT_TYPES, PaymentType } from "@/types/balance";

export interface CreateEntryInput {
  amount: string | number;
  date: Date | string;
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

// InputDate writes either a "dd/MM/yyyy" string (calendar picker) or a Date
// (typed input). Postgres `date` wants YYYY-MM-DD. Normalize at the boundary.
const toIsoDate = (value: Date | string): string | null => {
  if (value instanceof Date) {
    return isValid(value) ? format(value, "yyyy-MM-dd") : null;
  }
  if (typeof value !== "string" || !value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = parse(value, "dd/MM/yyyy", new Date());
  return isValid(parsed) ? format(parsed, "yyyy-MM-dd") : null;
};

async function createEntry(
  input: CreateEntryInput,
  kind: "sale" | "expense",
): Promise<ActionResult> {
  const occurredOn = toIsoDate(input.date);
  if (!occurredOn) return { error: "Falta la fecha" };
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
    occurred_on: occurredOn,
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
