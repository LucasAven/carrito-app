"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

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
      setError(signInError.message);
      setPending(false);
      return;
    }

    router.replace("/balance");
    router.refresh();
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <h1 className="text-2xl font-semibold">Iniciar sesión</h1>

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
          autoComplete="current-password"
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-800"
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
        {pending ? "Ingresando…" : "Ingresar"}
      </button>

      <p className="text-center text-sm">
        ¿No tenés cuenta?{" "}
        <Link className="underline" href="/signup">
          Registrate
        </Link>
      </p>
    </form>
  );
};

export default LoginPage;
