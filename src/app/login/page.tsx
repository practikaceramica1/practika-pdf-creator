import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/");

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden bg-gradient-to-br from-[#1a1f3d] via-[#1e2a55] to-[#10162e] p-12 text-white lg:block">
        <p className="text-sm uppercase tracking-[0.2em] text-indigo-200">Practika cerámica</p>
        <h1 className="mt-4 text-4xl font-semibold">Marketing PDF</h1>
        <p className="mt-3 max-w-md text-sm text-indigo-100">
          Creador de ofertas masivas, dossiers y catálogos para el equipo comercial.
        </p>
      </section>
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-neutral-900">Iniciar sesión</h2>
          <p className="mt-1 text-sm text-neutral-500">Mismas credenciales que el CRM</p>
          <div className="mt-5">
            <Suspense fallback={<div className="text-sm text-neutral-500">Cargando...</div>}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  );
}
