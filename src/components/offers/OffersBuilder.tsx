"use client";
/* eslint-disable @next/next/no-img-element */

import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import { useMemo, useRef, useState } from "react";
import { logoSrcForVariant, type LogoVariant } from "@/lib/offers-types";

const logoVariantOptions: { id: LogoVariant; label: string }[] = [
  { id: "white", label: "Blanco (fondos oscuros)" },
  { id: "anthracite", label: "Antracita (fondos claros)" },
  { id: "beige", label: "Beige / piedra" },
  { id: "blue", label: "Azul marino (marca)" },
];

type TemplateId =
  | "split-right"
  | "price-overlay"
  | "clean-card"
  | "hero-focus"
  | "catalog-strip"
  | "minimal-price"
  | "price-banner"
  | "duo-frame"
  | "editorial-left"
  | "tile-dominant";

const templateList: { id: TemplateId; label: string }[] = [
  { id: "split-right", label: "Split Right" },
  { id: "price-overlay", label: "Price Overlay" },
  { id: "clean-card", label: "Clean Card" },
  { id: "hero-focus", label: "Hero Focus" },
  { id: "catalog-strip", label: "Catalog Strip" },
  { id: "minimal-price", label: "Minimal Price" },
  { id: "price-banner", label: "Price Banner" },
  { id: "duo-frame", label: "Duo Frame" },
  { id: "editorial-left", label: "Editorial Left" },
  { id: "tile-dominant", label: "Tile Dominant" },
];

const defaults = {
  series: "PALAZZO",
  color: "PERLA",
  format: "60x120",
  material: "Porcelanico",
  pricePerM2: "7,50 EUR/m2",
  specialOfferText: "Special offer",
};

const badge =
  "inline-flex items-center rounded-[3px] border border-[#1a1f3d]/15 bg-[#E5ECFA] px-2.5 py-[5px] text-[9px] font-bold uppercase tracking-[0.18em] text-[#1a1f3d]";
const badgeLight =
  "inline-flex items-center rounded-[3px] border border-white/20 bg-white/12 px-2.5 py-[5px] text-[9px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm";

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function DropZone({
  label,
  onFile,
}: {
  label: string;
  onFile: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <button
      type="button"
      className="w-full rounded border border-dashed border-neutral-300 bg-white p-4 text-left text-sm hover:bg-neutral-50"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) onFile(file);
      }}
    >
      <input
        ref={inputRef}
        className="hidden"
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
        }}
      />
      <p className="font-medium text-neutral-800">{label}</p>
      <p className="mt-1 text-xs text-neutral-500">
        Arrastra una imagen o haz click para seleccionar
      </p>
    </button>
  );
}

function logoBgClass(variant: LogoVariant) {
  return variant === "white" || variant === "beige"
    ? "bg-[#1a1f3d]/90"
    : "bg-white/95";
}

function OfferPreview({
  template,
  heroSrc,
  tileSrc,
  logoSrc,
  logoVariant,
  series,
  color,
  format,
  material,
  pricePerM2,
  specialOfferText,
  previewRef,
}: {
  template: TemplateId;
  heroSrc: string;
  tileSrc: string;
  logoSrc: string;
  logoVariant: LogoVariant;
  series: string;
  color: string;
  format: string;
  material: string;
  pricePerM2: string;
  specialOfferText: string;
  previewRef: React.RefObject<HTMLDivElement | null>;
}) {
  const title = `${format} ${series}${color ? ` ${color}` : ""}`;
  const logoBg = logoBgClass(logoVariant);

  /* ── split-right ── */
  if (template === "split-right") {
    return (
      <div ref={previewRef} className="grid aspect-[16/9] w-full grid-cols-[1fr_minmax(0,30%)] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="relative min-h-0 overflow-hidden">
          <img src={heroSrc} alt="" className="h-full w-full object-cover" />
          <div className={`absolute left-5 top-5 flex items-center justify-center rounded-xl ${logoBg} px-4 py-3 shadow-md backdrop-blur-sm`}><img src={logoSrc} alt="" className="h-auto w-36 object-contain" /></div>
        </div>
        <div className="flex min-h-0 flex-col border-l border-slate-200 px-5 py-5">
          <span className={`w-fit ${badge}`}>{specialOfferText}</span>
          <div className="mt-4 flex-1 overflow-hidden rounded ring-1 ring-slate-200">
            <img src={tileSrc} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="mt-3">
            <p className="text-sm font-bold uppercase tracking-wide text-slate-900">{title}</p>
            <p className="mt-1 text-[11px] text-slate-500">{material}</p>
          </div>
          <p className="mt-2 text-xl font-bold tabular-nums text-[#1a1f3d]">{pricePerM2}</p>
        </div>
      </div>
    );
  }

  /* ── price-overlay ── */
  if (template === "price-overlay") {
    return (
      <div ref={previewRef} className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-900 shadow-sm">
        <img src={heroSrc} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/80" />
        <div className={`absolute left-5 top-5 flex items-center justify-center rounded-xl ${logoBg} px-4 py-3 shadow-md backdrop-blur-sm`}><img src={logoSrc} alt="" className="h-auto w-36 object-contain" /></div>
        <div className="absolute right-5 top-5 flex items-start gap-3">
          <span className={badgeLight}>{specialOfferText}</span>
        </div>
        <div className="absolute right-5 top-14 h-28 w-24 overflow-hidden rounded shadow-xl ring-2 ring-white/80">
          <img src={tileSrc} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-x-0 bottom-0 px-6 pb-5 pt-12">
          <div className="flex items-end justify-between gap-4 text-white">
            <div>
              <p className="text-lg font-bold uppercase tracking-wide drop-shadow">{title}</p>
              <p className="mt-1 text-xs text-white/70">{material}</p>
            </div>
            <p className="text-3xl font-bold tabular-nums text-[#fbbf24] drop-shadow">{pricePerM2}</p>
          </div>
        </div>
      </div>
    );
  }

  /* ── clean-card ── */
  if (template === "clean-card") {
    return (
      <div ref={previewRef} className="grid aspect-[16/9] w-full grid-cols-[1.15fr_1fr] overflow-hidden rounded-lg border border-slate-200 bg-[#f7f8fa] shadow-sm">
        <div className="relative min-h-0 overflow-hidden">
          <img src={heroSrc} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="flex min-h-0 flex-col px-6 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className={`flex items-center justify-center rounded-xl ${logoBg} px-4 py-3 shadow-md backdrop-blur-sm`}><img src={logoSrc} alt="" className="h-auto w-36 object-contain" /></div>
            <span className={`shrink-0 ${badge}`}>{specialOfferText}</span>
          </div>
          <div className="mt-4 border-l-[3px] border-[#1a1f3d] pl-4">
            <p className="text-base font-bold uppercase leading-snug tracking-wide text-slate-900">{title}</p>
            <p className="mt-1.5 text-xs text-slate-500">{material}</p>
          </div>
          <div className="mt-4 flex flex-1 items-center gap-5">
            <div className="h-full max-h-[8rem] w-[6.5rem] shrink-0 overflow-hidden rounded ring-1 ring-slate-200">
              <img src={tileSrc} alt="" className="h-full w-full object-cover" />
            </div>
            <p className="text-2xl font-bold tabular-nums text-[#1a1f3d]">{pricePerM2}</p>
          </div>
        </div>
      </div>
    );
  }

  /* ── hero-focus ── */
  if (template === "hero-focus") {
    return (
      <div ref={previewRef} className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-slate-200 bg-[#0f1429] shadow-sm">
        <img src={heroSrc} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/90 via-transparent to-[#1a1f3d]/25" />
        <div className={`absolute left-5 top-5 flex items-center justify-center rounded-xl ${logoBg} px-4 py-3 shadow-md backdrop-blur-sm`}><img src={logoSrc} alt="" className="h-auto w-36 object-contain" /></div>
        <span className={`absolute right-5 top-5 ${badgeLight}`}>{specialOfferText}</span>
        <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
          <div className="text-white">
            <p className="text-xl font-bold uppercase tracking-wide drop-shadow">{title}</p>
            <p className="mt-1 text-xs text-white/70">{material}</p>
            <p className="mt-2 text-2xl font-bold tabular-nums text-[#fbbf24] drop-shadow">{pricePerM2}</p>
          </div>
          <div className="h-28 w-24 shrink-0 overflow-hidden rounded shadow-2xl ring-2 ring-white/80">
            <img src={tileSrc} alt="" className="h-full w-full object-cover" />
          </div>
        </div>
      </div>
    );
  }

  /* ── catalog-strip ── */
  if (template === "catalog-strip") {
    return (
      <div ref={previewRef} className="flex aspect-[16/9] w-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="relative flex min-h-0 flex-1">
          <div className="min-h-0 min-w-0 flex-[1_1_78%] overflow-hidden">
            <img src={heroSrc} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="flex w-[22%] min-w-[90px] shrink-0 flex-col overflow-hidden border-l border-slate-100">
            <img src={tileSrc} alt="" className="h-full w-full object-cover" />
          </div>
          <div className={`absolute left-5 top-4 flex items-center justify-center rounded-xl ${logoBg} px-4 py-3 shadow-md backdrop-blur-sm`}><img src={logoSrc} alt="" className="h-auto w-36 object-contain" /></div>
        </div>
        <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-slate-200 px-5 py-3">
          <div className="flex items-center gap-3">
            <span className={badge}>{specialOfferText}</span>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-slate-900">{title}</p>
              <p className="mt-0.5 text-[11px] text-slate-500">{material}</p>
            </div>
          </div>
          <p className="text-xl font-bold tabular-nums text-[#1a1f3d]">{pricePerM2}</p>
        </footer>
      </div>
    );
  }

  /* ── minimal-price ── */
  if (template === "minimal-price") {
    return (
      <div ref={previewRef} className="grid aspect-[16/9] w-full grid-cols-[1fr_minmax(0,32%)] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="relative min-h-0 overflow-hidden">
          <img src={heroSrc} alt="" className="h-full w-full object-cover" />
          <div className={`absolute left-5 top-5 flex items-center justify-center rounded-xl ${logoBg} px-4 py-3 shadow-md backdrop-blur-sm`}><img src={logoSrc} alt="" className="h-auto w-36 object-contain" /></div>
        </div>
        <div className="flex min-h-0 flex-col bg-[#1a1f3d] px-5 py-5 text-white">
          <span className={`w-fit ${badgeLight}`}>{specialOfferText}</span>
          <div className="mt-4 flex-1 overflow-hidden rounded ring-1 ring-white/20">
            <img src={tileSrc} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="mt-3">
            <p className="text-sm font-bold uppercase leading-snug tracking-wide">{title}</p>
            <p className="mt-1 text-[11px] text-white/60">{material}</p>
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-white">{pricePerM2}</p>
        </div>
      </div>
    );
  }

  /* ── price-banner ── */
  if (template === "price-banner") {
    return (
      <div ref={previewRef} className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-900 shadow-sm">
        <img src={heroSrc} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/25" />
        <div className={`absolute left-5 top-5 flex items-center justify-center rounded-xl ${logoBg} px-4 py-3 shadow-md backdrop-blur-sm`}><img src={logoSrc} alt="" className="h-auto w-36 object-contain" /></div>
        <span className={`absolute right-5 top-5 ${badgeLight}`}>{specialOfferText}</span>
        <div className="absolute bottom-5 right-5 h-28 w-24 overflow-hidden rounded shadow-2xl ring-2 ring-white/80">
          <img src={tileSrc} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="absolute bottom-5 left-5 right-36 text-white">
          <p className="text-lg font-bold uppercase tracking-wide drop-shadow">{title}</p>
          <p className="mt-0.5 text-xs text-white/70">{material}</p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-[#fbbf24] drop-shadow">{pricePerM2}</p>
        </div>
      </div>
    );
  }

  /* ── duo-frame ── */
  if (template === "duo-frame") {
    return (
      <div ref={previewRef} className="grid aspect-[16/9] w-full grid-cols-[1fr_minmax(0,34%)] gap-3 overflow-hidden rounded-lg border border-slate-200 bg-[#f5f6f8] p-3 shadow-sm">
        <div className="relative min-h-0 overflow-hidden rounded-md shadow ring-1 ring-slate-200/80">
          <img src={heroSrc} alt="" className="h-full w-full object-cover" />
          <div className={`absolute left-4 top-4 flex items-center justify-center rounded-xl ${logoBg} px-4 py-3 shadow-md backdrop-blur-sm`}><img src={logoSrc} alt="" className="h-auto w-36 object-contain" /></div>
        </div>
        <div className="flex min-h-0 flex-col rounded-md bg-white p-4 shadow ring-1 ring-slate-100">
          <span className={`w-fit ${badge}`}>{specialOfferText}</span>
          <div className="mt-3 flex-1 overflow-hidden rounded ring-1 ring-slate-200">
            <img src={tileSrc} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="mt-3">
            <p className="text-sm font-bold uppercase leading-snug tracking-wide text-slate-900">{title}</p>
            <p className="mt-1 text-[11px] text-slate-500">{material}</p>
          </div>
          <p className="mt-2 text-xl font-bold tabular-nums text-[#1a1f3d]">{pricePerM2}</p>
        </div>
      </div>
    );
  }

  /* ── editorial-left ── */
  if (template === "editorial-left") {
    return (
      <div ref={previewRef} className="grid aspect-[16/9] w-full grid-cols-[minmax(0,34%)_1fr] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex min-h-0 flex-col border-r border-slate-200 px-5 py-5">
          <div className={`flex items-center justify-center rounded-xl ${logoBg} px-4 py-3 shadow-md backdrop-blur-sm`}><img src={logoSrc} alt="" className="h-auto w-36 object-contain" /></div>
          <span className={`mt-3 w-fit ${badge}`}>{specialOfferText}</span>
          <div className="mt-4 flex-1 overflow-hidden rounded ring-1 ring-slate-200">
            <img src={tileSrc} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="mt-3">
            <p className="text-sm font-bold uppercase leading-snug tracking-wide text-slate-900">{title}</p>
            <p className="mt-1 text-[11px] text-slate-500">{material}</p>
          </div>
          <p className="mt-2 text-xl font-bold tabular-nums text-[#1a1f3d]">{pricePerM2}</p>
        </div>
        <div className="min-h-0 overflow-hidden">
          <img src={heroSrc} alt="" className="h-full w-full object-cover" />
        </div>
      </div>
    );
  }

  /* ── tile-dominant ── */
  if (template === "tile-dominant") {
    return (
      <div ref={previewRef} className="grid aspect-[16/9] w-full grid-cols-[36%_1fr] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="min-h-0 overflow-hidden bg-[#f5f6f8]">
          <img src={tileSrc} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="relative flex min-h-0 flex-col">
          <div className="min-h-0 flex-1 overflow-hidden">
            <img src={heroSrc} alt="" className="h-full w-full object-cover" />
          </div>
          <div className={`absolute left-4 top-4 flex items-center justify-center rounded-xl ${logoBg} px-4 py-3 shadow-md backdrop-blur-sm`}><img src={logoSrc} alt="" className="h-auto w-36 object-contain" /></div>
          <div className="flex items-center justify-between gap-4 border-t border-slate-200 px-5 py-3">
            <div>
              <span className={`${badge} mb-1`}>{specialOfferText}</span>
              <p className="text-sm font-bold uppercase tracking-wide text-slate-900">{title}</p>
              <p className="mt-0.5 text-[11px] text-slate-500">{material}</p>
            </div>
            <p className="text-xl font-bold tabular-nums text-[#1a1f3d]">{pricePerM2}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export function OffersBuilder() {
  const [heroSrc, setHeroSrc] = useState("/catalog/placeholder-hero.svg");
  const [tileSrc, setTileSrc] = useState("/catalog/placeholder-tile.svg");
  const [logoVariant, setLogoVariant] = useState<LogoVariant>("white");
  const [series, setSeries] = useState(defaults.series);
  const [color, setColor] = useState(defaults.color);
  const [format, setFormat] = useState(defaults.format);
  const [material, setMaterial] = useState(defaults.material);
  const [pricePerM2, setPricePerM2] = useState(defaults.pricePerM2);
  const [specialOfferText, setSpecialOfferText] = useState(defaults.specialOfferText);

  const refs = useMemo(
    () => ({
      "split-right": { current: null } as React.RefObject<HTMLDivElement | null>,
      "price-overlay": { current: null } as React.RefObject<HTMLDivElement | null>,
      "clean-card": { current: null } as React.RefObject<HTMLDivElement | null>,
      "hero-focus": { current: null } as React.RefObject<HTMLDivElement | null>,
      "catalog-strip": { current: null } as React.RefObject<HTMLDivElement | null>,
      "minimal-price": { current: null } as React.RefObject<HTMLDivElement | null>,
      "price-banner": { current: null } as React.RefObject<HTMLDivElement | null>,
      "duo-frame": { current: null } as React.RefObject<HTMLDivElement | null>,
      "editorial-left": { current: null } as React.RefObject<HTMLDivElement | null>,
      "tile-dominant": { current: null } as React.RefObject<HTMLDivElement | null>,
    }),
    [],
  );

  async function downloadPng(template: TemplateId) {
    const node = refs[template].current;
    if (!node) return;
    const dataUrl = await toPng(node, { pixelRatio: 2 });
    const link = document.createElement("a");
    link.download = `practika-oferta-${template}.png`;
    link.href = dataUrl;
    link.click();
  }

  async function downloadPdf(template: TemplateId) {
    const node = refs[template].current;
    if (!node) return;
    const dataUrl = await toPng(node, { pixelRatio: 2 });
    const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: [960, 540] });
    pdf.addImage(dataUrl, "PNG", 0, 0, 960, 540);
    pdf.save(`practika-oferta-${template}.pdf`);
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 px-6 py-8">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Creador de ofertas</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Sube tus imagenes y descarga cada plantilla en PNG o PDF.
        </p>
      </div>

      <div className="grid gap-4 rounded border border-neutral-200 bg-neutral-50 p-4 md:grid-cols-2">
        <DropZone
          label="Imagen ambiente"
          onFile={async (file) => setHeroSrc(await fileToDataUrl(file))}
        />
        <DropZone
          label="Imagen pieza"
          onFile={async (file) => setTileSrc(await fileToDataUrl(file))}
        />
        <input
          className="rounded border border-neutral-300 bg-white px-3 py-2 text-sm"
          placeholder="Serie"
          value={series}
          onChange={(e) => setSeries(e.target.value)}
        />
        <input
          className="rounded border border-neutral-300 bg-white px-3 py-2 text-sm"
          placeholder="Color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
        <input
          className="rounded border border-neutral-300 bg-white px-3 py-2 text-sm"
          placeholder="Formato"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
        />
        <input
          className="rounded border border-neutral-300 bg-white px-3 py-2 text-sm"
          placeholder="Material"
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
        />
        <input
          className="rounded border border-neutral-300 bg-white px-3 py-2 text-sm"
          placeholder="Precio"
          value={pricePerM2}
          onChange={(e) => setPricePerM2(e.target.value)}
        />
        <input
          className="rounded border border-neutral-300 bg-white px-3 py-2 text-sm"
          placeholder="Texto oferta"
          value={specialOfferText}
          onChange={(e) => setSpecialOfferText(e.target.value)}
        />
        <label className="flex flex-col gap-1 md:col-span-2">
          <span className="text-xs font-medium text-neutral-600">Logo (contraste con el fondo)</span>
          <select
            className="rounded border border-neutral-300 bg-white px-3 py-2 text-sm"
            value={logoVariant}
            onChange={(e) => setLogoVariant(e.target.value as LogoVariant)}
          >
            {logoVariantOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-6">
        {templateList.map((tpl) => (
          <section key={tpl.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-700">
                {tpl.label}
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded bg-neutral-900 px-3 py-2 text-xs font-medium text-white hover:bg-neutral-700"
                  onClick={() => downloadPng(tpl.id)}
                >
                  Descargar PNG
                </button>
                <button
                  type="button"
                  className="rounded border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-900 hover:bg-neutral-100"
                  onClick={() => downloadPdf(tpl.id)}
                >
                  Descargar PDF
                </button>
              </div>
            </div>
            <OfferPreview
              template={tpl.id}
              previewRef={refs[tpl.id]}
              heroSrc={heroSrc}
              tileSrc={tileSrc}
              logoSrc={logoSrcForVariant(logoVariant)}
              logoVariant={logoVariant}
              series={series}
              color={color}
              format={format}
              material={material}
              pricePerM2={pricePerM2}
              specialOfferText={specialOfferText}
            />
          </section>
        ))}
      </div>
    </div>
  );
}
