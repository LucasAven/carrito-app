// One-time backfill of mom's history from her previous app into Carrito.
// See docs/legacy-import-plan.md for the rationale behind every mapping choice.
//
// Usage (run from the repo root):
//   node --env-file=.env.local scripts/import-legacy.mjs --email=mom@example.com            # dry-run
//   node --env-file=.env.local scripts/import-legacy.mjs --email=mom@example.com --commit   # writes
//
// Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (Dashboard > Project Settings >
// API). The service-role client bypasses RLS so rows can be inserted with an explicit
// user_id; the key stays local and is never committed.
//
// This project has "Automatically expose new tables" off, so service_role has no
// table privileges by default. Grant them for the backfill and revoke after:
//   grant select, insert on public.entries to service_role;   -- before
//   revoke select, insert on public.entries from service_role; -- after

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_FILES = ["2023.json", "2024.json", "2025.json", "2026.json"];

// Argentina has observed no DST since 2009, so a fixed UTC-3 offset converts the
// source epoch-millis instant to the Buenos Aires calendar day exactly across the
// whole 2023-2026 range. occurred_on is the day mom saw and intended.
const BA_OFFSET_MS = 3 * 60 * 60 * 1000;

const SAMPLE_COUNT = 5;
const peso = new Intl.NumberFormat("es-AR");

function die(message) {
	console.error(`\n  ✗ ${message}\n`);
	process.exit(1);
}

// Supabase errors can carry an empty `message` (e.g. on HEAD requests) while the
// useful detail sits in code/details/hint. Surface all of it so failures aren't blind.
function errText(error) {
	if (!error) return "unknown error";
	const parts = [error.message, error.code, error.details, error.hint].filter(
		Boolean,
	);
	return parts.length ? parts.join(" | ") : JSON.stringify(error);
}

function parseArgs(argv) {
	const args = { commit: false, email: null };
	for (const arg of argv) {
		if (arg === "--commit") args.commit = true;
		else if (arg.startsWith("--email="))
			args.email = arg.slice("--email=".length);
		else die(`Unknown argument: ${arg}`);
	}
	if (!args.email) die("Pass mom's address with --email=<address>");
	return args;
}

// epoch-millis string -> "yyyy-mm-dd" in Buenos Aires local time. Reading the
// shifted instant with UTC getters yields the BA-local calendar fields.
function toOccurredOn(epochMs) {
	const ms = Number(epochMs);
	if (!Number.isFinite(ms)) return null;
	const ba = new Date(ms - BA_OFFSET_MS);
	const y = ba.getUTCFullYear();
	const m = String(ba.getUTCMonth() + 1).padStart(2, "0");
	const d = String(ba.getUTCDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

// Trim and collapse internal whitespace (the data carries trailing spaces and a
// double space); fall back to the kind's default if nothing remains.
function cleanLabel(description, kind) {
	const text = String(description ?? "")
		.replace(/\s+/g, " ")
		.trim();
	return text || (kind === "sale" ? "Venta" : "Gasto");
}

// Map one raw source row to an Entry insert. Throws (aborting the whole run) on
// anything the data audit said should never happen, rather than skipping rows.
function mapRow(raw, kind, file) {
	const where = `${file} ${kind} value=${raw.value} date=${raw.date}`;

	const expectedTypeId = kind === "sale" ? 1 : 2;
	if (raw.transactionTypeId !== expectedTypeId) {
		die(
			`transactionTypeId ${raw.transactionTypeId} does not match ${kind} (${where})`,
		);
	}
	if (
		typeof raw.value !== "number" ||
		!Number.isFinite(raw.value) ||
		raw.value < 0
	) {
		die(`bad value (${where})`);
	}
	const occurredOn = toOccurredOn(raw.date);
	if (!occurredOn) die(`unparseable date (${where})`);
	if (!raw.createdAt || Number.isNaN(Date.parse(raw.createdAt))) {
		die(`bad createdAt (${where})`);
	}

	return {
		amount: raw.value, // whole pesos, inserted 1:1 into numeric(12,2)
		created_at: raw.createdAt,
		kind,
		label: cleanLabel(raw.description, kind),
		occurred_on: occurredOn,
		payment: "cash", // everything is cash; paymentTypeId is ignored
	};
}

function loadRows() {
	const rows = [];
	const perFile = [];
	for (const file of SOURCE_FILES) {
		let json;
		try {
			json = JSON.parse(readFileSync(join(ROOT, file), "utf8"));
		} catch (err) {
			die(`could not read ${file}: ${err.message}`);
		}
		const sales = json.sales ?? [];
		const expenses = json.expenses ?? [];

		let skipped = 0;
		const fileRows = [];
		for (const [kind, list] of [
			["sale", sales],
			["expense", expenses],
		]) {
			for (const raw of list) {
				if (raw.deletedAt != null) {
					skipped++; // deleted in the old app, do not import
					continue;
				}
				fileRows.push(mapRow(raw, kind, file));
			}
		}
		perFile.push({
			expenses: expenses.length,
			file,
			sales: sales.length,
			skipped,
		});
		rows.push(...fileRows);
	}
	// Chronological by when mom logged each, so within-day created_at order is honest.
	rows.sort((a, b) => a.created_at.localeCompare(b.created_at));
	return { perFile, rows };
}

function report(rows, perFile) {
	const sales = rows.filter((r) => r.kind === "sale");
	const expenses = rows.filter((r) => r.kind === "expense");
	const sum = (rs) => rs.reduce((t, r) => t + r.amount, 0);
	const dates = rows.map((r) => r.occurred_on).sort();

	console.log("\n  Per file:");
	for (const f of perFile) {
		const tail = f.skipped ? `  (skipped ${f.skipped} deleted)` : "";
		console.log(
			`    ${f.file}: ${f.sales} sales, ${f.expenses} expenses${tail}`,
		);
	}
	console.log("\n  Totals:");
	console.log(
		`    rows:     ${rows.length}  (${sales.length} sales, ${expenses.length} expenses)`,
	);
	console.log(`    ingresos: $ ${peso.format(sum(sales))}`);
	console.log(`    egresos:  $ ${peso.format(sum(expenses))}`);
	console.log(`    occurred_on: ${dates[0]} .. ${dates[dates.length - 1]}`);

	console.log("\n  Sample mapped rows:");
	for (const r of rows.slice(0, SAMPLE_COUNT)) {
		console.log(
			`    ${r.occurred_on}  ${r.kind.padEnd(7)}  $ ${peso.format(r.amount).padStart(9)}  ${r.payment}  "${r.label}"`,
		);
	}
}

async function resolveUserId(supabase, email) {
	const target = email.trim().toLowerCase();
	// listUsers is paginated; walk pages until the address turns up.
	for (let page = 1; page <= 100; page++) {
		const { data, error } = await supabase.auth.admin.listUsers({
			page,
			perPage: 200,
		});
		if (error) die(`could not list users: ${error.message}`);
		const match = data.users.find((u) => u.email?.toLowerCase() === target);
		if (match) return match.id;
		if (data.users.length < 200) break; // last page
	}
	die(`no Operator found for email ${email}`);
}

async function main() {
	const args = parseArgs(process.argv.slice(2));

	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
	if (!url)
		die("NEXT_PUBLIC_SUPABASE_URL is not set (run with --env-file=.env.local)");
	if (!serviceKey) die("SUPABASE_SERVICE_ROLE_KEY is not set in .env.local");

	const supabase = createClient(url, serviceKey, {
		auth: { autoRefreshToken: false, persistSession: false },
	});

	const userId = await resolveUserId(supabase, args.email);
	console.log(`\n  Operator: ${args.email} -> ${userId}`);

	const { perFile, rows } = loadRows();
	report(rows, perFile);

	if (!args.commit) {
		console.log(
			"\n  Dry run. Nothing written. Re-run with --commit to insert.\n",
		);
		return;
	}

	// The account is expected empty; refuse to write if it already has entries so a
	// second run cannot duplicate the history. A plain limited select (no HEAD,
	// no count) sidesteps the empty-body errors a HEAD count request can return.
	const { data: existing, error: existError } = await supabase
		.from("entries")
		.select("id")
		.eq("user_id", userId)
		.limit(1);
	if (existError)
		die(`could not check existing entries: ${errText(existError)}`);
	if (existing.length > 0) {
		die("Operator already has entries; aborting to avoid duplicates.");
	}

	// Insert and read the rows back, so the count is the database's own truth
	// rather than a second round-trip.
	const payload = rows.map((r) => ({ ...r, user_id: userId }));
	const { data: inserted, error: insertError } = await supabase
		.from("entries")
		.insert(payload)
		.select("id");
	if (insertError) die(`insert failed: ${errText(insertError)}`);

	console.log(`\n  ✓ Inserted ${inserted.length} entries.\n`);
}

main().catch((err) => die(err.stack ?? String(err)));
