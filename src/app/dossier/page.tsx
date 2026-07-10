import { DossierBuilder } from "@/components/dossier/DossierBuilder";

export default function DossierPage() {
  return (
    <div className="min-h-full bg-[#fafaf9]">
      <header className="border-b border-neutral-200 bg-white px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Practika · marketing</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">Dossier de serie</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-neutral-600">
          Genera un dossier corto (5 páginas) para enviar a clientes: ambiente, formatos con siluetas, características
          técnicas del CRM y colores. Misma imagen de marca Practika.
        </p>
      </header>
      <DossierBuilder />
    </div>
  );
}
