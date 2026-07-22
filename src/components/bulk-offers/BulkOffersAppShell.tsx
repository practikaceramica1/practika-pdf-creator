"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function BulkOffersAppShell({
  userEmail,
  children,
}: {
  userEmail: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const links = [
    { href: "/ofertas-masivas", label: "Creador" },
    { href: "/ofertas-masivas/historial", label: "Ofertas guardadas" },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-[var(--practika-primary)] text-white">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-indigo-200">Practika · Marketing</p>
            <h1 className="text-lg font-semibold">Creador de ofertas masivas</h1>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  pathname === link.href || pathname.startsWith(`${link.href}/`)
                    ? "bg-white/15 text-white"
                    : "text-indigo-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/" className="rounded-lg px-3 py-2 text-sm text-indigo-100 hover:bg-white/10 hover:text-white">
              Inicio
            </Link>
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-indigo-100 md:inline">{userEmail}</span>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-white/20 px-3 py-2 text-sm hover:bg-white/10"
            >
              Salir
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1600px] px-4 py-6 md:px-6">{children}</main>
    </div>
  );
}
