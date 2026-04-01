import type { NovedadesCatalog, NovedadesPage } from "@/lib/catalog-types";
import "@/app/print/novedades/print.css";

const brand = {
  ink: "#111111",
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

function PractikaWordmark({ dark = false }: { dark?: boolean }) {
  const src = dark ? "/brand/logo-anthracite.png" : "/brand/logo-white.png";
  return (
    <div className="mx-auto w-[58mm]">
      <CatalogImg src={src} alt="Practika Ceramica" className="w-full object-contain" />
    </div>
  );
}

function CoverPage(
  page: Extract<NovedadesPage, { type: "cover" }>,
) {
  return (
    <div className="print-page practika-stone flex flex-col">
      <header className="pt-[12mm]">
        <PractikaWordmark />
      </header>
      {page.hero ? (
        <div className="mx-[12mm] mt-[11mm] h-[174mm] overflow-hidden border-[2.5mm] border-[#f2eee7]">
          <CatalogImg
            src={page.hero.src}
            alt={page.hero.alt}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="mx-[12mm] mt-[11mm] h-[174mm] border-[2.5mm] border-[#f2eee7]" />
      )}
      <div className="mt-[9mm] text-center">
        <h1 className="text-[24pt] font-semibold uppercase tracking-[0.36em] text-[#f3f1ec]">
          {page.title}
        </h1>
        {page.subtitle ? (
          <p className="mt-1 text-[10pt] tracking-[0.14em] text-[#f3f1ec]">
            {page.subtitle}
          </p>
        ) : null}
      </div>
      <footer className="mt-auto pb-[11mm] pt-[8mm] text-center">
        {page.season ? (
          <p className="text-[8pt] uppercase tracking-[0.2em] text-[#efeee8]">
            {page.season}
          </p>
        ) : null}
      </footer>
    </div>
  );
}

function SectionPage(
  page: Extract<NovedadesPage, { type: "section" }>,
) {
  return (
    <div className="print-page practika-stone flex flex-col">
      <header className="pt-[10mm]">
        <PractikaWordmark />
      </header>
      <div className="relative mt-[9mm] flex-1">
        <div className="absolute left-[8mm] top-[78mm] z-20">
          <p className="origin-center -rotate-90 text-[16pt] uppercase tracking-[0.22em] text-black/90">
            {page.heading}
          </p>
        </div>
        <div className="absolute left-[34mm] top-[4mm] h-[176mm] w-[128mm] overflow-hidden">
          <CatalogImg
            src="/catalog/placeholder-hero.svg"
            alt={page.heading}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute left-[84mm] top-[148mm] z-10 h-[88mm] w-[132mm] overflow-hidden border-[2.5mm] border-white bg-[#dedad0]">
          <CatalogImg
            src="/catalog/placeholder-tile.svg"
            alt={page.heading}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
      {page.body ? (
        <p className="mt-2 px-[22mm] text-[8pt] leading-relaxed text-black/72">
          {page.body}
        </p>
      ) : null}
    </div>
  );
}

function LegendPage(page: Extract<NovedadesPage, { type: "legend" }>) {
  const src = page.imageSrc || "/catalog/symbology-reference.png";
  const alt = page.imageAlt || "Symbology";

  return (
    <div className="print-page">
      <CatalogImg src={src} alt={alt} className="h-full w-full object-cover" />
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
    <div className="print-page practika-stone">
      <header className="pt-[10mm]">
        <PractikaWordmark />
      </header>
      <div className="mx-[12mm] mt-[8mm] border-y border-white/80 py-[2.5mm] text-center">
        <p className="text-[10pt] uppercase tracking-[0.3em] text-black/80">
          Novedades
        </p>
      </div>
      <div className={`mx-[12mm] mt-[7mm] grid gap-x-[3mm] gap-y-[3mm] ${gridColsClass(page.columns)}`}>
        {page.products.map((p) => (
          <article
            key={`${p.name}-${p.format ?? "no-format"}`}
            className="flex flex-col bg-[#e5e0d3] p-[2.2mm]"
          >
            <div className="mb-[1.8mm] aspect-square w-full overflow-hidden border border-white/90 bg-neutral-100">
              {p.image ? (
                <CatalogImg
                  src={p.image.src}
                  alt={p.image.alt}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <h3 className="text-[9pt] font-semibold uppercase tracking-[0.05em] leading-snug">
              {p.name}
            </h3>
            {p.material ? (
              <p className="mt-[0.8mm] text-[7pt] tracking-[0.04em] text-black/70">
                {p.material}
              </p>
            ) : null}
            {p.format ? (
              <p className="mt-[0.8mm] text-[7pt] uppercase tracking-[0.06em] text-black/62">
                {p.format}
              </p>
            ) : null}
            {p.notes ? (
              <p className="mt-2 text-[7pt] leading-tight text-black/60">
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
    case "legend":
      return <LegendPage key={`legend-${index}`} {...page} />;
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
    <div className="print-root min-h-screen bg-white font-sans" style={{ color: brand.ink }}>
      {catalog.pages.map((p, i) => renderPage(p, i))}
    </div>
  );
}
