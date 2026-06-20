import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

import {
	isEntryKind,
	isPaymentType,
	labelForKind,
	parseSpokenAmount,
	toIsoDate,
} from "@/lib/entries/normalize";
import type { Database } from "@/types/supabase";

// Today in Buenos Aires. The server runs in UTC, so we cannot reuse the
// client's getTodaysDate(); compute the AR civil date explicitly.
function todayInBuenosAires(): string {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: "America/Argentina/Buenos_Aires",
	}).format(new Date()); // "YYYY-MM-DD"
}

const PESOS = new Intl.NumberFormat("es-AR", {
	currency: "ARS",
	maximumFractionDigits: 0,
	style: "currency",
});

// POST /api/shortcut/entries: invoked by an iOS Shortcut ("Hey Siri, nueva
// venta"). Authenticated by a personal bearer token; creates one entry for the
// token's Operator via the create_entry_via_token RPC. See
// docs/siri-shortcut-entries-plan.md.
export async function POST(request: NextRequest) {
	const authHeader = request.headers.get("authorization");
	const token = authHeader?.startsWith("Bearer ")
		? authHeader.slice("Bearer ".length).trim()
		: null;
	if (!token) {
		return NextResponse.json({ error: "Falta el token" }, { status: 401 });
	}

	let body: Record<string, unknown>;
	try {
		body = (await request.json()) as Record<string, unknown>;
	} catch {
		return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
	}

	const { amount, date, kind, label, payment } = body ?? {};

	if (typeof kind !== "string" || !isEntryKind(kind)) {
		return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
	}

	const amountValue =
		typeof amount === "number" || typeof amount === "string"
			? parseSpokenAmount(amount)
			: null;
	if (amountValue === null) {
		return NextResponse.json({ error: "Monto inválido" }, { status: 400 });
	}

	const paymentValue = payment == null || payment === "" ? "cash" : payment;
	if (typeof paymentValue !== "string" || !isPaymentType(paymentValue)) {
		return NextResponse.json(
			{ error: "Forma de pago inválida" },
			{ status: 400 },
		);
	}

	const rawDate = date == null || date === "" ? todayInBuenosAires() : date;
	if (typeof rawDate !== "string") {
		return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
	}
	const occurredOn = toIsoDate(rawDate);
	if (!occurredOn) {
		return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
	}

	const resolvedLabel = labelForKind(
		typeof label === "string" ? label : null,
		kind,
	);

	// Anon client, no cookies: the only authority is the token, validated inside
	// the SECURITY DEFINER function. No service_role key enters this runtime.
	const supabase = createClient<Database>(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{ auth: { persistSession: false } },
	);

	const { data, error } = await supabase.rpc("create_entry_via_token", {
		p_amount: amountValue,
		p_kind: kind,
		p_label: resolvedLabel,
		p_occurred_on: occurredOn,
		p_payment: paymentValue,
		p_token: token,
	});

	if (error) {
		if (error.code === "28000") {
			return NextResponse.json({ error: "Token inválido" }, { status: 401 });
		}
		return NextResponse.json(
			{ error: "No se pudo registrar" },
			{ status: 500 },
		);
	}

	const message =
		kind === "sale"
			? `Venta de ${PESOS.format(amountValue)} registrada`
			: `Gasto de ${PESOS.format(amountValue)} registrado`;

	return NextResponse.json(
		{
			entry: {
				amount: amountValue,
				id: data.id,
				kind: data.kind,
				label: data.label,
				occurred_on: data.occurred_on,
			},
			message,
		},
		{ status: 201 },
	);
}
