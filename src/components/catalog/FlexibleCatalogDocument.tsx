import type { CatalogDocument, CatalogPage, CatalogProduct, CatalogThemeId, ContentBlock } from "@/lib/catalog-builder-types";
import "@/app/print/novedades/print.css";

const ink = "#1a1a1a";
const anthracite = "#2d2d2d";
const beigeBorder = "#e8e4dc";
const stone = "#c6c1b1";
const stoneTile = "#e5e0d3";

function Img({ src, alt, className }: { src: string; alt: string; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} />;
}

function Wordmark({ variant }: { variant: "light" | "dark" }) {
  const src = variant === "dark" ? "/brand/logo-anthracite.png" : "/brand/logo-white.png";
  return (
    <div className="mx-auto w-[58mm]">
      <Img src={src} alt="Practika Cerámica" className="w-full object-contain" />
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

function themePageClass(theme: CatalogThemeId): string {
  switch (theme) {
    case "heritage-stone":
      return "practika-stone";
    case "editorial-light":
      return "";
    case "stone-contrast":
      return "bg-[#f5f3ee]";
    default:
      return "practika-stone";
  }
}

function themeSurfaceStyle(theme: CatalogThemeId): React.CSSProperties {
  if (theme === "editorial-light") return { background: "#ffffff", color: ink };
  if (theme === "stone-contrast") return { background: "#f5f3ee", color: ink };
  return { background: stone, color: ink };
}

function CoverPage({
  page,
  theme,
}: {
  page: Extract<CatalogPage, { type: "cover" }>;
  theme: CatalogThemeId;
}) {
  if (theme === "editorial-light") {
    return (
      <div className="print-page flex flex-col" style={{ background: "#fff", color: anthracite }}>
        <header className="border-b pt-[10mm]" style={{ borderColor: beigeBorder }}>
          <Wordmark variant="dark" />
        </header>
        {page.heroSrc ? (
          <div className="mx-[12mm] mt-[10mm] h-[174mm] overflow-hidden" style={{ border: `2.5mm solid ${beigeBorder}` }}>
            <Img src={page.heroSrc} alt="" className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="mx-[12mm] mt-[10mm] h-[174mm]" style={{ border: `2.5mm solid ${beigeBorder}`, background: "#faf9f7" }} />
        )}
        <div className="mt-[9mm] text-center">
          <h1 className="text-[24pt] font-semibold uppercase tracking-[0.28em]" style={{ color: anthracite }}>
            {page.title}
          </h1>
          {page.subtitle ? (
            <p className="mt-2 text-[10pt] tracking-[0.12em] text-neutral-600">{page.subtitle}</p>
          ) : null}
        </div>
        <footer className="mt-auto pb-[11mm] pt-[8mm] text-center">
          {page.season ? (
            <p className="text-[8pt] uppercase tracking-[0.2em] text-neutral-500">{page.season}</p>
          ) : null}
        </footer>
      </div>
    );
  }

  if (theme === "stone-contrast") {
    return (
      <div className="print-page flex flex-col bg-[#2d2d2d] text-white">
        <header className="pt-[12mm]">
          <Wordmark variant="light" />
        </header>
        {page.heroSrc ? (
          <div className="mx-[12mm] mt-[11mm] h-[174mm] overflow-hidden border-[2.5mm] border-[#c4c0b8]">
            <Img src={page.heroSrc} alt="" className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="mx-[12mm] mt-[11mm] h-[174mm] border-[2.5mm] border-[#c4c0b8] bg-neutral-800" />
        )}
        <div className="mt-[9mm] text-center">
          <h1 className="text-[24pt] font-semibold uppercase tracking-[0.36em] text-[#f5f3ef]">{page.title}</h1>
          {page.subtitle ? <p className="mt-1 text-[10pt] tracking-[0.14em] text-white/85">{page.subtitle}</p> : null}
        </div>
        <footer className="mt-auto pb-[11mm] pt-[8mm] text-center">
          {page.season ? (
            <p className="text-[8pt] uppercase tracking-[0.2em] text-white/75">{page.season}</p>
          ) : null}
        </footer>
      </div>
    );
  }

  /* heritage-stone */
  return (
    <div className={`print-page practika-stone flex flex-col`}>
      <header className="pt-[12mm]">
        <Wordmark variant="light" />
      </header>
      {page.heroSrc ? (
        <div className="mx-[12mm] mt-[11mm] h-[174mm] overflow-hidden border-[2.5mm] border-[#f2eee7]">
          <Img src={page.heroSrc} alt="" className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="mx-[12mm] mt-[11mm] h-[174mm] border-[2.5mm] border-[#f2eee7]" />
      )}
      <div className="mt-[9mm] text-center">
        <h1 className="text-[24pt] font-semibold uppercase tracking-[0.36em] text-[#f3f1ec]">{page.title}</h1>
        {page.subtitle ? (
          <p className="mt-1 text-[10pt] tracking-[0.14em] text-[#f3f1ec]">{page.subtitle}</p>
        ) : null}
      </div>
      <footer className="mt-auto pb-[11mm] pt-[8mm] text-center">
        {page.season ? (
          <p className="text-[8pt] uppercase tracking-[0.2em] text-[#efeee8]">{page.season}</p>
        ) : null}
      </footer>
    </div>
  );
}

function SectionPage({
  page,
  theme,
}: {
  page: Extract<CatalogPage, { type: "section" }>;
  theme: CatalogThemeId;
}) {
  const bar =
    theme === "stone-contrast" ? (
      <div className="absolute inset-x-0 top-0 h-[14mm] bg-[#2d2d2d]" />
    ) : null;

  return (
    <div className={`print-page relative flex flex-col ${themePageClass(theme)}`} style={themeSurfaceStyle(theme)}>
      {bar}
      <header className={`relative z-10 ${theme === "stone-contrast" ? "pt-[16mm]" : "pt-[10mm]"}`}>
        <Wordmark variant={theme === "heritage-stone" ? "light" : "dark"} />
      </header>
      <div className="relative z-10 mt-[9mm] flex-1 px-[14mm]">
        <p
          className="text-[16pt] font-semibold uppercase leading-snug tracking-wide"
          style={{ color: theme === "heritage-stone" ? "#111" : anthracite }}
        >
          {page.heading}
        </p>
        {page.body ? (
          <p
            className="mt-[6mm] text-[9pt] leading-relaxed"
            style={{ color: theme === "heritage-stone" ? "rgba(0,0,0,0.72)" : "rgba(45,45,45,0.85)" }}
          >
            {page.body}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function LegendPage(page: Extract<CatalogPage, { type: "legend" }>) {
  const src = page.imageSrc || "/catalog/placeholder-tile.svg";
  return (
    <div className="print-page">
      <Img src={src} alt={page.imageAlt || "Simbología"} className="h-full w-full object-cover" />
    </div>
  );
}

function GridPage({
  page,
  theme,
}: {
  page: Extract<CatalogPage, { type: "grid" }>;
  theme: CatalogThemeId;
}) {
  const headerBand =
    theme === "stone-contrast" ? <div className="absolute inset-x-0 top-0 h-[12mm] bg-[#2d2d2d]" /> : null;

  const productCard = (p: CatalogProduct) => (
    <article
      key={p.id}
      className="flex flex-col p-[2.2mm]"
      style={{
        background: theme === "editorial-light" ? "#f7f5f0" : stoneTile,
      }}
    >
      <div className="mb-[1.8mm] aspect-square w-full overflow-hidden border border-white/90 bg-neutral-100">
        {p.imageSrc ? <Img src={p.imageSrc} alt={p.name} className="h-full w-full object-cover" /> : null}
      </div>
      <h3 className="text-[9pt] font-semibold uppercase leading-snug tracking-[0.05em] text-black/90">{p.name}</h3>
      {p.material ? <p className="mt-[0.8mm] text-[7pt] tracking-[0.04em] text-black/70">{p.material}</p> : null}
      {p.format ? (
        <p className="mt-[0.8mm] text-[7pt] uppercase tracking-[0.06em] text-black/62">{p.format}</p>
      ) : null}
      {p.notes ? <p className="mt-2 text-[7pt] leading-tight text-black/60">{p.notes}</p> : null}
    </article>
  );

  return (
    <div className={`print-page relative ${themePageClass(theme)}`} style={themeSurfaceStyle(theme)}>
      {headerBand}
      <header className={`relative z-10 ${theme === "stone-contrast" ? "pt-[16mm]" : "pt-[10mm]"}`}>
        <Wordmark variant={theme === "heritage-stone" ? "light" : "dark"} />
      </header>
      <div
        className="relative z-10 mx-[12mm] mt-[8mm] border-y py-[2.5mm] text-center"
        style={{ borderColor: theme === "heritage-stone" ? "rgba(255,255,255,0.8)" : beigeBorder }}
      >
        <p className="text-[10pt] uppercase tracking-[0.28em] text-black/80">Catálogo</p>
      </div>
      <div className={`relative z-10 mx-[12mm] mt-[7mm] grid gap-x-[3mm] gap-y-[3mm] ${gridColsClass(page.columns)}`}>
        {page.products.map(productCard)}
      </div>
    </div>
  );
}

function BlocksPage({
  page,
  theme,
}: {
  page: Extract<CatalogPage, { type: "blocks" }>;
  theme: CatalogThemeId;
}) {
  const renderBlock = (b: ContentBlock) => {
    if (b.kind === "heading") {
      return (
        <h2
          key={b.id}
          className="text-[14pt] font-semibold uppercase tracking-[0.12em]"
          style={{ color: theme === "heritage-stone" ? "#111" : anthracite }}
        >
          {b.text}
        </h2>
      );
    }
    if (b.kind === "paragraph") {
      return (
        <p key={b.id} className="text-[9pt] leading-relaxed" style={{ color: "rgba(0,0,0,0.78)" }}>
          {b.text}
        </p>
      );
    }
    return (
      <figure key={b.id} className="space-y-2">
        <div className="overflow-hidden" style={{ border: `1px solid ${beigeBorder}` }}>
          <Img src={b.src || "/catalog/placeholder-tile.svg"} alt="" className="max-h-[90mm] w-full object-cover" />
        </div>
        {b.caption ? <figcaption className="text-[8pt] text-neutral-600">{b.caption}</figcaption> : null}
      </figure>
    );
  };

  return (
    <div className={`print-page flex flex-col ${themePageClass(theme)}`} style={themeSurfaceStyle(theme)}>
      <header className="pt-[10mm]">
        <Wordmark variant={theme === "heritage-stone" ? "light" : "dark"} />
      </header>
      <div className="mx-[14mm] mt-[10mm] flex flex-col gap-[5mm]">{page.blocks.map(renderBlock)}</div>
    </div>
  );
}

function renderPage(page: CatalogPage, theme: CatalogThemeId) {
  switch (page.type) {
    case "cover":
      return <CoverPage key={page.id} page={page} theme={theme} />;
    case "section":
      return <SectionPage key={page.id} page={page} theme={theme} />;
    case "legend":
      return <LegendPage key={page.id} {...page} />;
    case "grid":
      return <GridPage key={page.id} page={page} theme={theme} />;
    case "blocks":
      return <BlocksPage key={page.id} page={page} theme={theme} />;
    default:
      return null;
  }
}

export function FlexibleCatalogDocument({ catalog }: { catalog: CatalogDocument }) {
  return (
    <div className="print-root min-h-screen font-sans" style={{ color: ink }}>
      {catalog.pages.map((p) => renderPage(p, catalog.theme))}
    </div>
  );
}
