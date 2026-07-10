/* eslint-disable @next/next/no-img-element */
import { FormatShapeBlock } from "@/components/dossier/FormatShape";
import {
  TECH_FILTER_LABELS,
  collectDossierColors,
  type DossierDocument,
  type DossierTechFilters,
} from "@/lib/dossier-types";
import { formatLabelDisplay } from "@/lib/format-display";
import "@/app/print/dossier/print.css";

function Img({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return <img src={src} alt={alt} className={className} crossOrigin="anonymous" />;
}

function Wordmark({ variant }: { variant: "light" | "dark" }) {
  const src = variant === "dark" ? "/brand/logo-anthracite.png" : "/brand/logo-white.png";
  return (
    <div className="w-[52mm]">
      <Img src={src} alt="Practika Cerámica" className="w-full object-contain" />
    </div>
  );
}

function TechChip({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded border border-[#1a1f3d]/15 bg-[#E5ECFA] px-2 py-1 text-[7pt] font-semibold uppercase tracking-wide text-[#1a1f3d]">
      {label}
    </span>
  );
}

function TechSection({ tech }: { tech: DossierTechFilters }) {
  const entries = (Object.keys(TECH_FILTER_LABELS) as (keyof DossierTechFilters)[])
    .map((key) => ({ key, label: TECH_FILTER_LABELS[key], values: tech[key] }))
    .filter((e) => e.values.length > 0);

  if (!entries.length) {
    return <p className="text-[9pt] text-neutral-500">Sin características técnicas en el CRM para esta serie.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {entries.map((entry) => (
        <div key={entry.key} className="rounded border border-[#e8e4dc] bg-white/80 p-3">
          <p className="text-[7.5pt] font-bold uppercase tracking-wide text-[#1a1f3d]">{entry.label}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {entry.values.map((v) => (
              <TechChip key={v} label={v} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function CoverPage({ doc }: { doc: DossierDocument }) {
  return (
    <div className="dossier-page dossier-stone flex">
      <div className="flex w-[42%] flex-col px-[14mm] py-[12mm]">
        <Wordmark variant="light" />
        <div className="mt-auto">
          <p className="text-[8pt] uppercase tracking-[0.28em] text-white/75">{doc.subtitle}</p>
          <h1 className="mt-3 text-[32pt] font-semibold uppercase leading-none tracking-[0.12em] text-white">
            {doc.seriesName}
          </h1>
          {doc.materials.length ? (
            <p className="mt-4 text-[9pt] uppercase tracking-[0.16em] text-white/85">
              {doc.materials.join(" · ")}
            </p>
          ) : null}
          <p className="mt-8 text-[8pt] uppercase tracking-[0.22em] text-white/70">{doc.season}</p>
        </div>
      </div>
      <div className="relative flex-1 p-[10mm] pl-0">
        <div className="h-full overflow-hidden border-[3mm] border-[#f2eee7]">
          <Img src={doc.heroImage} alt="" className="h-full w-full object-cover" />
        </div>
      </div>
    </div>
  );
}

function IntroPage({ doc }: { doc: DossierDocument }) {
  const ambient = doc.ambientImages[1] || doc.ambientImages[0] || doc.heroImage;
  return (
    <div className="dossier-page flex bg-[#f6f4ef]">
      <div className="w-[55%] p-[12mm]">
        <Wordmark variant="dark" />
        <h2 className="mt-[10mm] text-[22pt] font-semibold uppercase tracking-[0.14em] text-[#1a1f3d]">
          {doc.seriesName}
        </h2>
        <p className="mt-[6mm] max-w-[120mm] text-[10pt] leading-relaxed text-neutral-700">{doc.intro}</p>
        {doc.materials.length ? (
          <div className="mt-[8mm]">
            <p className="text-[7.5pt] font-bold uppercase tracking-wide text-[#1a1f3d]">Material</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {doc.materials.map((m) => (
                <TechChip key={m} label={m} />
              ))}
            </div>
          </div>
        ) : null}
        {doc.catalogFormats.length ? (
          <div className="mt-[6mm]">
            <p className="text-[7.5pt] font-bold uppercase tracking-wide text-[#1a1f3d]">Formatos</p>
            <p className="mt-1 text-[9pt] text-neutral-700">
              {doc.catalogFormats.map((f) => formatLabelDisplay(f.formatLabel)).join(" · ")}
            </p>
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-[4mm] p-[10mm] pl-0">
        <div className="min-h-0 flex-1 overflow-hidden border border-[#e8e4dc]">
          <Img src={ambient} alt="" className="h-full w-full object-cover" />
        </div>
        {doc.ambientImages[2] ? (
          <div className="h-[38%] overflow-hidden border border-[#e8e4dc]">
            <Img src={doc.ambientImages[2]} alt="" className="h-full w-full object-cover" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function FormatsPage({ doc }: { doc: DossierDocument }) {
  const formats = doc.catalogFormats.slice(0, 6);
  return (
    <div className="dossier-page flex flex-col bg-white px-[14mm] py-[12mm]">
      <div className="flex items-end justify-between border-b border-[#e8e4dc] pb-[5mm]">
        <div>
          <p className="text-[8pt] uppercase tracking-[0.2em] text-neutral-500">Multiformato</p>
          <h2 className="text-[20pt] font-semibold uppercase tracking-[0.1em] text-[#1a1f3d]">{doc.seriesName}</h2>
        </div>
        <Wordmark variant="dark" />
      </div>
      <div className="mt-[8mm] grid flex-1 grid-cols-3 gap-[5mm] content-start">
        {formats.map((fmt) => (
          <FormatShapeBlock
            key={fmt.id}
            formatLabel={fmt.formatLabel}
            widthCm={fmt.widthCm}
            heightCm={fmt.heightCm}
            materialName={fmt.materialName}
          />
        ))}
      </div>
      {formats.length === 0 ? (
        <p className="text-[10pt] text-neutral-500">No hay formatos publicados en el CRM para esta serie.</p>
      ) : null}
    </div>
  );
}

function TechnicalPage({ doc }: { doc: DossierDocument }) {
  const formats = doc.catalogFormats.slice(0, 5);
  return (
    <div className="dossier-page flex flex-col bg-[#f6f4ef] px-[14mm] py-[12mm]">
      <div className="flex items-end justify-between border-b border-[#e8e4dc] pb-[5mm]">
        <div>
          <p className="text-[8pt] uppercase tracking-[0.2em] text-neutral-500">Aspectos técnicos</p>
          <h2 className="text-[18pt] font-semibold uppercase tracking-[0.1em] text-[#1a1f3d]">{doc.seriesName}</h2>
        </div>
        <Wordmark variant="dark" />
      </div>

      <div className="mt-[6mm] overflow-hidden rounded border border-[#e8e4dc] bg-white">
        <table className="w-full border-collapse text-[8pt]">
          <thead>
            <tr className="bg-[#1a1f3d] text-left text-white">
              <th className="px-3 py-2 font-semibold uppercase tracking-wide">Formato</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide">Material</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide">Espesor</th>
              <th className="px-3 py-2 font-semibold uppercase tracking-wide">Acabados</th>
            </tr>
          </thead>
          <tbody>
            {formats.map((fmt, i) => (
              <tr key={fmt.id} className={i % 2 ? "bg-[#faf9f7]" : ""}>
                <td className="px-3 py-2 font-medium">{formatLabelDisplay(fmt.formatLabel)}</td>
                <td className="px-3 py-2">{fmt.materialName || "—"}</td>
                <td className="px-3 py-2">{fmt.thickness?.join(", ") || doc.tech.thickness.join(", ") || "—"}</td>
                <td className="px-3 py-2">
                  {[...(fmt.finishSurface || []), ...(fmt.finishCut || [])].join(", ") || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-[6mm] flex-1">
        <TechSection tech={doc.tech} />
      </div>
    </div>
  );
}

function ColorsPage({ doc }: { doc: DossierDocument }) {
  const colors = collectDossierColors(doc.catalogFormats, 8);
  return (
    <div className="dossier-page dossier-stone flex flex-col px-[14mm] py-[12mm]">
      <div className="flex items-end justify-between border-b border-white/25 pb-[5mm]">
        <div>
          <p className="text-[8pt] uppercase tracking-[0.2em] text-white/70">Colores</p>
          <h2 className="text-[20pt] font-semibold uppercase tracking-[0.1em] text-white">{doc.seriesName}</h2>
        </div>
        <Wordmark variant="light" />
      </div>
      <div className="mt-[8mm] grid flex-1 grid-cols-4 gap-[5mm] content-start">
        {colors.map((color) => (
          <div key={color.id} className="flex flex-col overflow-hidden rounded border border-white/30 bg-white/95">
            <div className="aspect-square bg-[#ece8df]">
              {color.image ? (
                <Img src={color.image} alt={color.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-[8pt] text-neutral-400">Sin imagen</div>
              )}
            </div>
            <div className="px-2 py-2 text-center">
              <p className="text-[8pt] font-semibold uppercase tracking-wide text-[#1a1f3d]">{color.name}</p>
              {color.variantType !== "regular" ? (
                <p className="text-[7pt] uppercase text-neutral-500">{color.variantType}</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      {colors.length === 0 ? (
        <p className="text-[10pt] text-white/80">No hay colores con imagen en el CRM.</p>
      ) : null}
    </div>
  );
}

export function DossierSeriesDocument({ doc }: { doc: DossierDocument }) {
  return (
    <div className="dossier-print-root">
      <CoverPage doc={doc} />
      <IntroPage doc={doc} />
      <FormatsPage doc={doc} />
      <TechnicalPage doc={doc} />
      <ColorsPage doc={doc} />
    </div>
  );
}

/** Preview scaled down in the builder sidebar. */
export function DossierPagePreview({
  doc,
  page,
}: {
  doc: DossierDocument;
  page: "cover" | "intro" | "formats" | "technical" | "colors";
}) {
  const content = {
    cover: <CoverPage doc={doc} />,
    intro: <IntroPage doc={doc} />,
    formats: <FormatsPage doc={doc} />,
    technical: <TechnicalPage doc={doc} />,
    colors: <ColorsPage doc={doc} />,
  }[page];

  return <div className="dossier-print-root">{content}</div>;
}
