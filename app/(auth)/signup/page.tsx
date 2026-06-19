"use client";

import { FormEvent, useState } from "react";
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
        <h1 className="text-2xl font-semibold">Revisá tu email</h1>
        <p className="text-sm">
          Te mandamos un link de confirmación a <strong>{email}</strong>. Tocalo
          desde el celu y volvés a la app logueada.
        </p>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <h1 className="text-2xl font-semibold">Crear cuenta</h1>

      <label className="flex flex-col gap-1 text-sm">
        Email
        <input
          autoComplete="email"
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-800"
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          value={email}
          required
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Contraseña
        <input
          autoComplete="new-password"
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-800"
          minLength={6}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          value={password}
          required
        />
      </label>

      {error && <p className="text-sm text-cost">{error}</p>}

      <button
        className="rounded-md bg-earn px-3 py-2 font-semibold text-white disabled:opacity-50"
        disabled={pending}
        type="submit"
      >
        {pending ? "Creando cuenta…" : "Crear cuenta"}
      </button>

      <p className="text-center text-sm">
        ¿Ya tenés cuenta?{" "}
        <Link className="underline" href="/login">
          Ingresá
        </Link>
      </p>
    </form>
  );
};

export default SignupPage;
