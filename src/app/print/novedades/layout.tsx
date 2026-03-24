import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impresión · Novedades · Practika",
  robots: { index: false, follow: false },
};

export default function NovedadesPrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-neutral-900">{children}</div>
  );
}
