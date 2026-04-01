import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impresion · Ofertas · Practika",
  robots: { index: false, follow: false },
};

export default function OfertasPrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-white text-neutral-900">{children}</div>;
}
