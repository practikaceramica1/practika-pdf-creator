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

/** Paleta alineada con practika-web (sin tonos crema). */
const badgeOffer =
  "inline-flex items-center rounded-sm bg-[#E5ECFA] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#1a1f3d]";
const badgeOfferMd =
  "inline-flex items-center rounded-sm bg-[#E5ECFA] px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#1a1f3d]";

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

function OfferPreview({
  template,
  heroSrc,
  tileSrc,
  logoSrc,
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
  series: string;
  color: string;
  format: string;
  material: string;
  pricePerM2: string;
  specialOfferText: string;
  previewRef: React.RefObject<HTMLDivElement | null>;
}) {
  const title = `${format} ${series}${color ? ` ${color}` : ""}`;

  if (template === "price-overlay") {
    return (
      <div
        ref={previewRef}
        className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-900 shadow-sm"
      >
        <img src={heroSrc} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1f3d]/55 via-transparent to-[#0f172a]/90" />
        <div className="absolute left-5 top-5">
          <img src={logoSrc} alt="" className="w-[7.5rem] drop-shadow-lg" />
        </div>
        <span className={`absolute right-5 top-5 ${badgeOfferMd}`}>{specialOfferText}</span>
        <div className="absolute right-5 top-[4.25rem] h-40 w-[5.75rem] overflow-hidden rounded-sm shadow-xl ring-2 ring-white/90">
          <img src={tileSrc} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-[#1a1f3d]/88 px-6 py-4 backdrop-blur-[2px]">
          <div className="flex flex-wrap items-end justify-between gap-3 text-white">
            <div>
              <p className="text-lg font-semibold uppercase tracking-wide">{title}</p>
              <p className="mt-1 text-xs text-white/75">{material}</p>
            </div>
            <p className="text-2xl font-semibold tabular-nums text-[#fbbf24]">{pricePerM2}</p>
          </div>
        </div>
      </div>
    );
  }

  if (template === "clean-card") {
    return (
      <div
        ref={previewRef}
        className="grid aspect-[16/9] w-full grid-cols-[1.15fr_1fr] gap-4 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm"
      >
        <div className="relative min-h-0 overflow-hidden rounded-md shadow-md ring-1 ring-slate-200/90">
          <img src={heroSrc} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="flex min-h-0 flex-col rounded-md bg-white p-5 shadow-md ring-1 ring-slate-100">
          <img src={logoSrc} alt="" className="h-auto w-28" />
          <span className={`mt-4 w-fit ${badgeOfferMd}`}>{specialOfferText}</span>
          <div className="mt-5 border-l-[3px] border-[#1a1f3d] pl-4">
            <p className="text-[15px] font-semibold uppercase leading-snug tracking-wide text-slate-900">{title}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{material}</p>
          </div>
          <div className="mt-4 h-28 w-[5.25rem] shrink-0 overflow-hidden rounded-sm ring-1 ring-slate-200">
            <img src={tileSrc} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="mt-auto border-t border-slate-200 pt-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#1a1f3d]">Precio especial</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{pricePerM2}</p>
          </div>
        </div>
      </div>
    );
  }

  if (template === "hero-focus") {
    return (
      <div
        ref={previewRef}
        className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-slate-200 bg-[#0f1429] shadow-sm"
      >
        <img src={heroSrc} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#1a1f3d]/95 via-[#1a1f3d]/35 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-[#1a1f3d]/40" />
        <div className="absolute left-5 top-5">
          <img src={logoSrc} alt="" className="w-[7.5rem] drop-shadow-md" />
        </div>
        <span className={`absolute right-5 top-5 ${badgeOfferMd}`}>{specialOfferText}</span>
        <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-stretch gap-4">
          <div className="min-w-[200px] flex-1 rounded-md border border-white/15 bg-black/35 px-5 py-4 text-white backdrop-blur-md">
            <p className="text-2xl font-semibold uppercase leading-tight tracking-wide">{title}</p>
            <p className="mt-2 text-sm text-white/85">{pricePerM2}</p>
            <p className="mt-1 text-xs text-white/65">{material}</p>
          </div>
          <div className="h-32 w-24 shrink-0 overflow-hidden rounded-md shadow-2xl ring-2 ring-white/80">
            <img src={tileSrc} alt="" className="h-full w-full object-cover" />
          </div>
        </div>
      </div>
    );
  }

  if (template === "catalog-strip") {
    return (
      <div
        ref={previewRef}
        className="flex aspect-[16/9] w-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shadow-sm"
      >
        <header className="flex h-12 shrink-0 items-center justify-between bg-[#1a1f3d] px-4">
          <img src={logoSrc} alt="" className="h-8 w-auto" />
          <span className={badgeOffer}>{specialOfferText}</span>
        </header>
        <div className="flex min-h-0 flex-1 gap-3 p-3">
          <div className="min-h-0 min-w-0 flex-[1_1_72%] overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-slate-200/80">
            <img src={heroSrc} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="flex w-[17%] min-w-[72px] shrink-0 flex-col overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-slate-200/80">
            <img src={tileSrc} alt="" className="h-full w-full object-cover" />
          </div>
        </div>
        <footer className="flex shrink-0 items-end justify-between gap-4 border-t border-slate-200 bg-white px-4 py-3">
          <div>
            <p className="text-base font-semibold uppercase tracking-wide text-slate-900">{title}</p>
            <p className="mt-0.5 text-xs text-slate-500">{material}</p>
          </div>
          <p className="text-2xl font-semibold tabular-nums text-[#1a1f3d]">{pricePerM2}</p>
        </footer>
      </div>
    );
  }

  if (template === "minimal-price") {
    return (
      <div
        ref={previewRef}
        className="grid aspect-[16/9] w-full grid-cols-[1fr_minmax(0,34%)] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
      >
        <div className="relative min-h-0 overflow-hidden">
          <img src={heroSrc} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
        </div>
        <div className="flex min-h-0 flex-col bg-[#1a1f3d] px-5 py-5 text-white">
          <img src={logoSrc} alt="" className="h-auto w-24" />
          <span className="mt-4 w-fit rounded-sm border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
            {specialOfferText}
          </span>
          <div className="mt-4 h-36 w-20 overflow-hidden rounded-sm ring-1 ring-white/25">
            <img src={tileSrc} alt="" className="h-full w-full object-cover" />
          </div>
          <p className="mt-4 text-sm font-semibold uppercase leading-snug tracking-wide">{title}</p>
          <p className="mt-1 text-xs text-white/70">{material}</p>
          <div className="mt-auto border-t border-white/15 pt-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#fbbf24]">Precio</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{pricePerM2}</p>
          </div>
        </div>
      </div>
    );
  }

  if (template === "price-banner") {
    return (
      <div
        ref={previewRef}
        className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-900 shadow-sm"
      >
        <img src={heroSrc} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-x-0 top-0 flex h-12 items-center bg-gradient-to-r from-[#1a1f3d] to-[#2a3156] px-4 shadow-md">
          <img src={logoSrc} alt="" className="h-8 w-auto" />
          <span className={`ml-auto ${badgeOffer}`}>{specialOfferText}</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0f172a] via-[#1a1f3d]/92 to-transparent px-5 pb-5 pt-16">
          <div className="flex items-end justify-between gap-4 text-white">
            <div>
              <p className="text-xl font-semibold uppercase tracking-wide">{title}</p>
              <p className="mt-1 text-xs text-white/75">{material}</p>
            </div>
            <p className="text-3xl font-semibold tabular-nums text-[#fbbf24]">{pricePerM2}</p>
          </div>
        </div>
      </div>
    );
  }

  if (template === "duo-frame") {
    return (
      <div
        ref={previewRef}
        className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100 p-3 shadow-sm"
      >
        <div className="absolute left-3 top-3 h-[68%] w-[58%] overflow-hidden rounded-md shadow-lg ring-2 ring-[#1a1f3d]/20">
          <img src={heroSrc} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="absolute left-[50%] top-[44%] z-10 h-[48%] w-[24%] overflow-hidden rounded-md shadow-2xl ring-4 ring-white">
          <img src={tileSrc} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="absolute right-3 top-3 w-[28%] rounded-md bg-white p-4 shadow-xl ring-1 ring-slate-200/90">
          <img src={logoSrc} alt="" className="w-24" />
          <span className={`mt-3 block w-fit ${badgeOffer}`}>{specialOfferText}</span>
          <p className="mt-4 text-base font-semibold uppercase leading-snug tracking-wide text-slate-900">{title}</p>
          <p className="mt-1 text-xs text-slate-600">{material}</p>
          <p className="mt-4 text-2xl font-semibold tabular-nums text-[#1a1f3d]">{pricePerM2}</p>
        </div>
      </div>
    );
  }

  if (template === "editorial-left") {
    return (
      <div
        ref={previewRef}
        className="grid aspect-[16/9] w-full grid-cols-[minmax(0,30%)_1fr] gap-3 overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-br from-slate-100 to-slate-200 p-3 shadow-sm"
      >
        <div className="flex min-h-0 flex-col rounded-md bg-white p-4 shadow-lg ring-1 ring-slate-200/80">
          <img src={logoSrc} alt="" className="w-24" />
          <span className={`mt-3 w-fit ${badgeOffer}`}>{specialOfferText}</span>
          <p className="mt-5 text-base font-semibold uppercase leading-snug text-slate-900">{title}</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">{material}</p>
          <div className="mt-auto border-t border-slate-200 pt-4">
            <p className="rounded-md bg-[#1a1f3d] py-2.5 text-center text-xl font-semibold tabular-nums text-white">{pricePerM2}</p>
          </div>
        </div>
        <div className="min-h-0 overflow-hidden rounded-md shadow-inner ring-2 ring-white">
          <img src={heroSrc} alt="" className="h-full w-full object-cover" />
        </div>
      </div>
    );
  }

  if (template === "tile-dominant") {
    return (
      <div
        ref={previewRef}
        className="grid aspect-[16/9] w-full grid-cols-[36%_1fr] grid-rows-[1fr_auto] gap-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-3 shadow-sm"
      >
        <div className="row-span-2 min-h-0 overflow-hidden rounded-md bg-[#E5ECFA]/60 ring-1 ring-slate-200/90">
          <img src={tileSrc} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="min-h-0 overflow-hidden rounded-md ring-1 ring-slate-200 shadow-sm">
          <img src={heroSrc} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="col-start-2 rounded-md border-t-[3px] border-[#1a1f3d] bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <img src={logoSrc} alt="" className="mb-2 w-24" />
              <p className="text-base font-semibold uppercase leading-snug text-slate-900">{title}</p>
              <p className="mt-1 text-xs text-slate-600">{material}</p>
            </div>
            <span className={badgeOffer}>{specialOfferText}</span>
          </div>
          <p className="mt-3 text-2xl font-semibold tabular-nums text-[#1a1f3d]">{pricePerM2}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={previewRef}
      className="grid aspect-[16/9] w-full grid-cols-[1fr_minmax(0,23%)] gap-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-3 shadow-sm"
    >
      <div className="relative min-h-0 overflow-hidden rounded-md shadow-md ring-1 ring-slate-200/90">
        <img src={heroSrc} alt="" className="h-full w-full object-cover" />
        <div className="absolute left-4 top-4">
          <img src={logoSrc} alt="" className="w-28 drop-shadow-md" />
        </div>
      </div>
      <div className="flex min-h-0 flex-col rounded-md bg-white p-3 shadow-md ring-1 ring-slate-100">
        <span className={badgeOffer}>{specialOfferText}</span>
        <div className="mt-3 min-h-0 flex-1 overflow-hidden rounded-sm ring-1 ring-slate-200">
          <img src={tileSrc} alt="" className="h-full min-h-[100px] w-full object-cover" />
        </div>
        <div className="mt-3 border-t border-slate-200 pt-2 text-[11px] leading-snug text-slate-800">
          <p className="font-semibold uppercase tracking-wide">{title}</p>
          <p className="mt-1 font-semibold tabular-nums text-[#1a1f3d]">{pricePerM2}</p>
          <p className="mt-0.5 text-slate-600">{material}</p>
        </div>
      </div>
    </div>
  );
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
