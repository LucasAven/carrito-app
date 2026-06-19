"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/client";

const SignupPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);
	const [submitted, setSubmitted] = useState(false);

	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setPending(true);
		setError(null);

		const supabase = createClient();
		const { error: signUpError } = await supabase.auth.signUp({
			email,
			options: {
				emailRedirectTo: `${window.location.origin}/auth/callback?next=/balance`,
			},
			password,
		});

		if (signUpError) {
			setError(signUpError.message);
			setPending(false);
			return;
		}

		setSubmitted(true);
		setPending(false);
	};

	if (submitted) {
		return (
			<div className="flex flex-col gap-3">
				<h1 className="font-display text-ink dark:text-ink-dark text-3xl font-extrabold">
					Revisá tu email
				</h1>
				<p className="text-muted dark:text-muted-dark text-sm">
					Te mandamos un link de confirmación a{" "}
					<strong className="text-ink dark:text-ink-dark">{email}</strong>.
					Tocalo desde el celu y volvés a la app logueada.
				</p>
			</div>
		);
	}

	return (
		<form className="flex flex-col gap-4" onSubmit={onSubmit}>
			<h1 className="font-display text-ink dark:text-ink-dark text-3xl font-extrabold">
				Crear cuenta
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
					autoComplete="new-password"
					className="bg-surface dark:bg-surface-dark text-ink dark:text-ink-dark placeholder:text-faint rounded-[14px] px-4 py-3.5 text-base shadow-[0_1px_4px_rgba(58,42,34,0.05)] outline-none"
					minLength={6}
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
				{pending ? "Creando cuenta…" : "Crear cuenta"}
			</button>

			<p className="text-muted dark:text-muted-dark text-center text-sm">
				¿Ya tenés cuenta?{" "}
				<Link className="text-brand font-bold" href="/login">
					Ingresá
				</Link>
			</p>
		</form>
	);
};

export default SignupPage;
