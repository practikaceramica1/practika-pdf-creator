"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AppNav({ userEmail }: { userEmail: string }) {
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-8 py-3">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <Link href="/" className="font-semibold text-[var(--practika-primary)]">
            Practika Marketing
          </Link>
          <Link href="/ofertas-masivas" className="text-neutral-600 hover:text-neutral-900">
            Ofertas masivas
          </Link>
          <Link href="/ofertas-masivas/historial" className="text-neutral-600 hover:text-neutral-900">
            Historial
          </Link>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-neutral-500 md:inline">{userEmail}</span>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-neutral-700 hover:bg-neutral-50"
          >
            Salir
          </button>
        </div>
      </div>
    </div>
  );
}
