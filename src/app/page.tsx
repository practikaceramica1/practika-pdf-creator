import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col justify-center gap-8 px-8 py-16">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-amber-800/80">
          Practika · documentación marketing
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">
          Ofertas, dossiers y catálogos
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-600">
          Genera PDFs e imágenes con la imagen de marca Practika para enviar a clientes por email o WhatsApp.
        </p>
      </div>
      <ul className="flex flex-col gap-3 text-sm">
        <li className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Dossiers</li>
        <li>
          <Link
            className="font-medium text-amber-900 underline-offset-4 hover:underline"
            href="/dossier"
          >
            Dossier de serie (CRM → PDF 5 páginas)
          </Link>
        </li>

        <li className="pt-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Catálogos</li>
        <li>
          <Link
            className="font-medium text-amber-900 underline-offset-4 hover:underline"
            href="/catalogo"
          >
            Generador de catálogos grandes (páginas, bloques, PDF / JSON)
          </Link>
        </li>
        <li>
          <Link
            className="font-medium text-amber-900 underline-offset-4 hover:underline"
            href="/novedades"
          >
            Creador de catálogo novedades (drag and drop + PNG/PDF)
          </Link>
        </li>
        <li>
          <Link
            className="font-medium text-amber-900 underline-offset-4 hover:underline"
            href="/print/novedades"
          >
            Ver / imprimir catálogo novedades (navegador)
          </Link>
        </li>

        <li className="pt-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Ofertas</li>
        <li>
          <Link
            className="font-medium text-amber-900 underline-offset-4 hover:underline"
            href="/ofertas"
          >
            Creador visual (PNG/PDF por plantilla)
          </Link>
        </li>
      </ul>
    </div>
  );
}
