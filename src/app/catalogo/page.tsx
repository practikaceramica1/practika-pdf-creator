import { CatalogBuilder } from "@/components/catalog-builder/CatalogBuilder";

export default function CatalogoGeneratorPage() {
  return (
    <div className="min-h-full bg-[#fafaf9]">
      <header className="border-b border-neutral-200 bg-white px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Practika · interno</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">Generador de catálogos</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-neutral-600">
          Monta páginas (portada, texto, rejillas, bloques), reordénalas y exporta PDF o JSON. Los temas usan piedra,
          blanco y antracita —pensados para impresión y PDF profesional, sin azul dominante.
        </p>
      </header>
      <CatalogBuilder />
    </div>
  );
}
