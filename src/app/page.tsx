import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col justify-center gap-8 px-8 py-16">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-amber-800/80">
          Practika · generador de catálogos
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">
          PDF de novedades
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-600">
          Previsualiza el maquetado en{" "}
          <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">
            /print/novedades
          </code>{" "}
          y, con el servidor en marcha, descarga el PDF desde la API.
        </p>
      </div>
      <ul className="flex flex-col gap-3 text-sm">
        <li>
          <Link
            className="font-medium text-amber-900 underline-offset-4 hover:underline"
            href="/print/novedades"
          >
            Ver / imprimir catálogo de novedades (navegador)
          </Link>
        </li>
        <li>
          <a
            className="font-medium text-amber-900 underline-offset-4 hover:underline"
            href="/api/pdf/novedades"
          >
            Descargar PDF (requiere servidor activo)
          </a>
        </li>
      </ul>
      <p className="text-xs text-neutral-500">
        Los datos de ejemplo viven en{" "}
        <code className="rounded bg-neutral-100 px-1">src/data/novedades-sample.ts</code>.
        Sustituye imágenes en{" "}
        <code className="rounded bg-neutral-100 px-1">public/catalog/</code>.
      </p>
    </div>
  );
}
