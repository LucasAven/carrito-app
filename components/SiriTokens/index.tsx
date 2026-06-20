"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import {
	createToken,
	revokeToken,
	type ShortcutToken,
} from "@/app/actions/tokens";

// Two signed iCloud links, one per hands-free shortcut ("Venta" and "Gasto").
// Each shortcut's Import Question asks the person for their token on add, so the
// same two links work for everyone. Set once after sharing each shortcut from
// the Shortcuts app (Compartir, Copiar enlace de iCloud).
const VENTA_URL = process.env.NEXT_PUBLIC_SIRI_VENTA_URL;
const GASTO_URL = process.env.NEXT_PUBLIC_SIRI_GASTO_URL;

const dateFmt = new Intl.DateTimeFormat("es-AR", {
	day: "2-digit",
	month: "short",
	year: "numeric",
});

const formatDate = (iso: string | null): string =>
	iso ? dateFmt.format(new Date(iso)) : "nunca";

function AddShortcutButton({
	envName,
	label,
	url,
}: {
	envName: string;
	label: string;
	url: string | undefined;
}) {
	if (!url) {
		return (
			<p className="rounded-md border border-dashed border-zinc-300 p-3 text-xs text-zinc-500 dark:border-zinc-700">
				Falta el link de <strong>{label}</strong>. Compartí el atajo desde la
				app Atajos (Copiar enlace de iCloud) y guardalo en{" "}
				<code>{envName}</code>.
			</p>
		);
	}

	return (
		<a
			className="rounded-md bg-indigo-600 px-3 py-2 text-center font-semibold text-white"
			href={url}
			rel="noreferrer"
			target="_blank"
		>
			Agregar &quot;{label}&quot;
		</a>
	);
}

function CopyButton({ label, value }: { label: string; value: string }) {
	const [copied, setCopied] = useState(false);

	const onCopy = async () => {
		await navigator.clipboard.writeText(value);
		setCopied(true);
		window.setTimeout(() => setCopied(false), 2000);
	};

	return (
		<button
			aria-label={label}
			className="inline-flex shrink-0 items-center gap-1 rounded-md bg-zinc-200 px-2 py-1 text-xs font-medium dark:bg-zinc-700"
			onClick={onCopy}
			type="button"
		>
			{copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
			{copied ? "Copiado" : "Copiar"}
		</button>
	);
}

export function SiriTokens({ tokens }: { tokens: ShortcutToken[] }) {
	const router = useRouter();
	const [name, setName] = useState("");
	const [creating, setCreating] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [newToken, setNewToken] = useState<string | null>(null);
	const [revokingId, setRevokingId] = useState<string | null>(null);

	const onCreate = async () => {
		setCreating(true);
		setError(null);
		setNewToken(null);
		const result = await createToken(name);
		setCreating(false);
		if (result.error) {
			setError(result.error);
			return;
		}
		setNewToken(result.token ?? null);
		setName("");
		router.refresh();
	};

	const onRevoke = async (id: string) => {
		if (
			!window.confirm("¿Revocar este token? La Shortcut dejará de funcionar.")
		)
			return;
		setRevokingId(id);
		setError(null);
		const result = await revokeToken(id);
		setRevokingId(null);
		if (result.error) {
			setError(result.error);
			return;
		}
		router.refresh();
	};

	return (
		<div className="flex flex-col gap-6">
			<p className="text-sm text-zinc-600 dark:text-zinc-400">
				Conectá un iPhone para cargar ventas o gastos hablándole a Siri, sin
				abrir la app.
			</p>

			<ol className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-800">
				<li>
					<strong>1.</strong> Generá tu token acá abajo y copialo.
				</li>
				<li>
					<strong>2.</strong> Tocá <em>Agregar &quot;Venta&quot;</em>. Cuando el
					iPhone te pregunte, pegá el token y tocá <em>Agregar atajo</em>.
				</li>
				<li>
					<strong>3.</strong> Tocá <em>Agregar &quot;Gasto&quot;</em> y hacé lo
					mismo: pegá el mismo token.
				</li>
				<li>
					<strong>4.</strong> Listo, sin manos: decí &quot;Oye Siri, venta&quot;
					o &quot;Oye Siri, gasto&quot; y después el monto.
				</li>
			</ol>

			<div className="flex flex-col gap-3">
				<AddShortcutButton
					envName="NEXT_PUBLIC_SIRI_VENTA_URL"
					label="Venta"
					url={VENTA_URL}
				/>
				<AddShortcutButton
					envName="NEXT_PUBLIC_SIRI_GASTO_URL"
					label="Gasto"
					url={GASTO_URL}
				/>
			</div>

			<div className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
				<label className="text-sm font-medium" htmlFor="token-name">
					Nombre del dispositivo
				</label>
				<input
					id="token-name"
					onChange={(e) => setName(e.target.value)}
					placeholder="iPhone de mamá"
					type="text"
					value={name}
				/>
				<button
					className="bg-earn rounded-md px-3 py-2 font-semibold text-white disabled:opacity-50"
					disabled={creating}
					onClick={onCreate}
					type="button"
				>
					{creating ? "Generando…" : "Generar token"}
				</button>
			</div>

			{newToken && (
				<div className="border-earn bg-earn/5 flex flex-col gap-3 rounded-lg border p-4">
					<p className="text-earn text-sm font-semibold">
						Token generado. Copialo ahora, no se vuelve a mostrar. Pegalo cuando
						el iPhone te lo pida al agregar la Shortcut.
					</p>

					<div className="flex items-center gap-2">
						<code className="grow overflow-x-auto rounded bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-800">
							{newToken}
						</code>
						<CopyButton label="Copiar token" value={newToken} />
					</div>
				</div>
			)}

			{error && <p className="text-cost text-sm">{error}</p>}

			<div className="flex flex-col gap-3">
				<h2 className="text-sm font-semibold">Tokens</h2>
				{tokens.length === 0 ? (
					<p className="text-sm text-zinc-500">Todavía no generaste ninguno.</p>
				) : (
					<ul className="flex flex-col gap-2">
						{tokens.map((token) => {
							const revoked = token.revoked_at !== null;
							return (
								<li
									key={token.id}
									className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
								>
									<div className="flex flex-col gap-0.5">
										<span className="text-sm font-medium">
											{token.name || "Sin nombre"}
										</span>
										<span className="text-xs text-zinc-500">
											Creado {formatDate(token.created_at)} · Último uso{" "}
											{formatDate(token.last_used_at)}
										</span>
									</div>
									{revoked ? (
										<span className="shrink-0 text-xs font-medium text-zinc-400">
											Revocado
										</span>
									) : (
										<button
											className="bg-cost shrink-0 rounded-md px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
											disabled={revokingId === token.id}
											onClick={() => onRevoke(token.id)}
											type="button"
										>
											{revokingId === token.id ? "Revocando…" : "Revocar"}
										</button>
									)}
								</li>
							);
						})}
					</ul>
				)}
			</div>
		</div>
	);
}
