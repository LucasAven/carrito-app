"use server";

import { createHash, randomBytes } from "crypto";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

const SIRI_PATH = "/conectar-siri";

export interface ShortcutToken {
	created_at: string;
	id: string;
	last_used_at: string | null;
	name: string | null;
	revoked_at: string | null;
}

const sha256Hex = (value: string): string =>
	createHash("sha256").update(value).digest("hex");

export async function listTokens(): Promise<ShortcutToken[]> {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from("api_tokens")
		.select("id, name, created_at, last_used_at, revoked_at")
		.order("created_at", { ascending: false });

	if (error) throw error;
	return data ?? [];
}

interface CreateTokenResult {
	// The raw token, returned exactly once. Never retrievable again.
	error?: string;
	token?: string;
}

export async function createToken(name: string): Promise<CreateTokenResult> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return { error: "Sesión expirada" };

	// High-entropy token. We store only its hash; the raw value lives only in
	// this response and, from there, in the Shortcut's header.
	const token = randomBytes(32).toString("base64url");

	const { error } = await supabase.from("api_tokens").insert({
		name: name.trim() || null,
		operator_id: user.id,
		token_hash: sha256Hex(token),
	});

	if (error) return { error: error.message };

	revalidatePath(SIRI_PATH);
	return { token };
}

interface ActionResult {
	error?: string;
}

export async function revokeToken(id: string): Promise<ActionResult> {
	if (!id) return { error: "Falta el id" };

	const supabase = await createClient();
	const { error } = await supabase
		.from("api_tokens")
		.update({ revoked_at: new Date().toISOString() })
		.eq("id", id);

	if (error) return { error: error.message };

	revalidatePath(SIRI_PATH);
	return {};
}
