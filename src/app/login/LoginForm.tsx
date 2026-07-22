"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: signError } = await supabase.auth.signInWithPassword({ email, password });
      if (signError) {
        setError("Credenciales inválidas");
        return;
      }
      const next = searchParams.get("next") || "/ofertas-masivas";
      router.push(next);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-[var(--practika-primary)] focus:ring-2 focus:ring-[var(--practika-highlight)]"
          required
          disabled={loading}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-[var(--practika-primary)] focus:ring-2 focus:ring-[var(--practika-highlight)]"
          required
          disabled={loading}
        />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        className="w-full rounded-lg bg-[var(--practika-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--practika-primary-light)] disabled:opacity-60"
        disabled={loading || !email || !password}
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
