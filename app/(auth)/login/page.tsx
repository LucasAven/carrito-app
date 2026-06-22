"use client";

import { type FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { getAuthErrorMessage, getCallbackErrorMessage } from "@/lib/auth/errors";
import { createClient } from "@/lib/supabase/client";

const LoginPage = () => {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

	// The auth callback redirects here with ?error=... when an email link fails;
	// surface it in Spanish instead of silently dropping the Operator on the form.
	useEffect(() => {
		const code = new URLSearchParams(window.location.search).get("error");
		if (code) setError(getCallbackErrorMessage(code));
	}, []);

	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setPending(true);
		setError(null);

		const supabase = createClient();
		const { error: signInError } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (signInError) {
			setError(getAuthErrorMessage(signInError));
			setPending(false);
			return;
		}

		router.replace("/balance");
		router.refresh();
	};

	return (
		<form className="flex flex-col gap-4" onSubmit={onSubmit}>
			<h1 className="font-display text-ink dark:text-ink-dark text-3xl font-extrabold">
				Iniciar sesión
			</h1>

			<label className="text-label dark:text-label-dark flex flex-col gap-1.5 text-sm font-extrabold">
				Email
				<input
					autoComplete="email"
					className="bg-surface dark:bg-surface-dark text-ink dark:text-ink-dark placeholder:text-faint rounded-[14px] px-4 py-3.5 text-base shadow-[0_1px_4px_rgba(58,42,34,0.05)] outline-none"
					onChange={(event) => setEmail(event.target.value)}
					type="email"
					value={email}
					required
				/>
			</label>

			<label className="text-label dark:text-label-dark flex flex-col gap-1.5 text-sm font-extrabold">
				Contraseña
				<input
					autoComplete="current-password"
					className="bg-surface dark:bg-surface-dark text-ink dark:text-ink-dark placeholder:text-faint rounded-[14px] px-4 py-3.5 text-base shadow-[0_1px_4px_rgba(58,42,34,0.05)] outline-none"
					onChange={(event) => setPassword(event.target.value)}
					type="password"
					value={password}
					required
				/>
			</label>

			{error && <p className="text-cost text-sm font-semibold">{error}</p>}

			<button
				className="bg-earn font-display mt-1 rounded-full py-3.5 font-bold text-white shadow-[0_6px_16px_rgba(31,157,107,0.3)] disabled:opacity-60"
				disabled={pending}
				type="submit"
			>
				{pending ? "Ingresando…" : "Ingresar"}
			</button>

			<p className="text-muted dark:text-muted-dark text-center text-sm">
				¿No tenés cuenta?{" "}
				<Link className="text-brand font-bold" href="/signup">
					Registrate
				</Link>
			</p>
		</form>
	);
};

export default LoginPage;
