import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col justify-center gap-8 px-8 py-16">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-amber-800/80">
          Practika · generador de catálogos
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">
          Generador de novedades y ofertas
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-600">
          Previsualiza los maquetados y descarga PDFs o imagenes para compartir
          por email y WhatsApp.
        </p>
      </div>
      <ul className="flex flex-col gap-3 text-sm">
        <li className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Novedades
        </li>
        <li>
          <Link
            className="font-medium text-amber-900 underline-offset-4 hover:underline"
            href="/print/novedades"
          >
            Ver / imprimir catalogo de novedades (navegador)
          </Link>
        </li>
        <li>
          <Link
            className="font-medium text-amber-900 underline-offset-4 hover:underline"
            href="/novedades"
          >
            Creador visual de novedades (drag and drop + PNG/PDF)
          </Link>
        </li>
        <li>
          <a
            className="font-medium text-amber-900 underline-offset-4 hover:underline"
            href="/api/pdf/novedades"
          >
            Descargar PDF de novedades
          </a>
        </li>
        <li className="pt-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Ofertas
        </li>
        <li>
          <Link
            className="font-medium text-amber-900 underline-offset-4 hover:underline"
            href="/ofertas"
          >
            Creador visual con drag and drop (PNG/PDF por plantilla)
          </Link>
        </li>
      </ul>
      <p className="text-xs text-neutral-500">
        Datos de muestra en{" "}
        <code className="rounded bg-neutral-100 px-1">src/data/novedades-sample.ts</code> y{" "}
        <code className="rounded bg-neutral-100 px-1">src/data/ofertas-sample.ts</code>.
      </p>
    </div>
  );
}
