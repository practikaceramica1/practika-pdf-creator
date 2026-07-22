import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { headers } from "next/headers";
import { AppNav } from "@/components/AppNav";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Practika · Marketing PDF",
  description: "Ofertas, dossiers y catálogos PDF",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const pathname = (await headers()).get("x-pathname") || "";
  const showAppNav = Boolean(user?.email) && !pathname.startsWith("/ofertas-masivas");

  return (
    <html lang="es" className={`${outfit.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        {showAppNav ? <AppNav userEmail={user!.email!} /> : null}
        {children}
      </body>
    </html>
  );
}
