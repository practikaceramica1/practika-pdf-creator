import type { NovedadesCatalog, NovedadesPage } from "@/lib/catalog-types";
import "@/app/print/novedades/print.css";

const brand = {
  accent: "#8B4513",
  muted: "#5c5752",
  line: "#c9c4be",
};

function CatalogImg({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  /* <img> evita optimización async de Next/Image en flujos PDF */
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} />
  );
}

function CoverPage(
  page: Extract<NovedadesPage, { type: "cover" }>,
) {
  return (
    <div className="print-page flex flex-col justify-between border-b-4" style={{ borderColor: brand.accent }}>
      <header className="flex items-start justify-between gap-6">
        <div>
          <p className="text-[10pt] uppercase tracking-[0.2em]" style={{ color: brand.muted }}>
            Practika Cerámica
          </p>
          <h1 className="mt-2 text-[32pt] font-semibold leading-tight tracking-tight">
            {page.title}
          </h1>
          {page.subtitle ? (
            <p className="mt-2 text-[14pt]" style={{ color: brand.muted }}>
              {page.subtitle}
            </p>
          ) : null}
        </div>
        {page.season ? (
          <div
            className="shrink-0 rounded px-3 py-1 text-[9pt] font-medium uppercase tracking-wider text-white"
            style={{ backgroundColor: brand.accent }}
          >
            {page.season}
          </div>
        ) : null}
      </header>
      {page.hero ? (
        <div className="mt-6 flex-1 overflow-hidden rounded-sm border" style={{ borderColor: brand.line }}>
          <CatalogImg
            src={page.hero.src}
            alt={page.hero.alt}
            className="h-full max-h-[180mm] w-full object-cover"
          />
        </div>
      ) : (
        <div className="mt-auto flex-1" />
      )}
      <footer className="mt-8 flex justify-between border-t pt-4 text-[8pt]" style={{ borderColor: brand.line, color: brand.muted }}>
        <span>www.practikaceramica.com</span>
        <span>Catálogo de novedades</span>
      </footer>
    </div>
  );
}

function SectionPage(
  page: Extract<NovedadesPage, { type: "section" }>,
) {
  return (
    <div className="print-page flex flex-col">
      <div className="mb-8 h-1 w-24" style={{ backgroundColor: brand.accent }} />
      <h2 className="text-[22pt] font-semibold">{page.heading}</h2>
      {page.body ? (
        <p className="mt-6 max-w-prose text-[11pt] leading-relaxed" style={{ color: brand.muted }}>
          {page.body}
        </p>
      ) : null}
    </div>
  );
}

function gridColsClass(cols: 2 | 3 | 4) {
  switch (cols) {
    case 2:
      return "grid-cols-2";
    case 4:
      return "grid-cols-4";
    default:
      return "grid-cols-3";
  }
}

function GridPage(page: Extract<NovedadesPage, { type: "grid" }>) {
  return (
    <div className="print-page">
      <div className={`grid gap-x-4 gap-y-6 ${gridColsClass(page.columns)}`}>
        {page.products.map((p) => (
          <article
            key={p.sku}
            className="flex flex-col border-t pt-3"
            style={{ borderColor: brand.line }}
          >
            <div className="mb-2 aspect-square w-full overflow-hidden bg-neutral-100">
              {p.image ? (
                <CatalogImg
                  src={p.image.src}
                  alt={p.image.alt}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <p className="text-[8pt] font-semibold uppercase tracking-wide" style={{ color: brand.accent }}>
              {p.sku}
            </p>
            <h3 className="text-[10pt] font-medium leading-snug">{p.name}</h3>
            {p.format ? (
              <p className="mt-1 text-[8pt]" style={{ color: brand.muted }}>
                {p.format}
              </p>
            ) : null}
            {p.notes ? (
              <p className="mt-2 text-[7pt] leading-tight" style={{ color: brand.muted }}>
                {p.notes}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}

function renderPage(page: NovedadesPage, index: number) {
  switch (page.type) {
    case "cover":
      return <CoverPage key={`cover-${index}`} {...page} />;
    case "section":
      return <SectionPage key={`section-${index}`} {...page} />;
    case "grid":
      return <GridPage key={`grid-${index}`} {...page} />;
    default:
      return null;
  }
}

export function NovedadesPrintDocument({ catalog }: { catalog: NovedadesCatalog }) {
  return (
    <div className="print-root min-h-screen bg-white font-sans">
      {catalog.pages.map((p, i) => renderPage(p, i))}
    </div>
  );
}
