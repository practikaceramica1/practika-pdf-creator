"use client";
/* eslint-disable @next/next/no-img-element */

import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import { useMemo, useRef, useState } from "react";

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
        className="relative aspect-[16/9] w-full overflow-hidden rounded border border-neutral-200 bg-[#f6f4ef]"
      >
        <img src={heroSrc} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute left-4 top-4">
          <img src="/brand/logo-white.png" alt="" className="w-28" />
        </div>
        <div className="absolute right-4 top-4 rounded bg-[#f3efe6] px-3 py-1 text-xs font-semibold uppercase text-[#5f4a35]">
          {specialOfferText}
        </div>
        <div className="absolute right-4 top-14 h-44 w-24 overflow-hidden border-2 border-white">
          <img src={tileSrc} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="absolute bottom-4 left-4 rounded bg-black/65 px-4 py-3 text-white">
          <p className="text-lg font-semibold uppercase">{title}</p>
          <p className="text-sm">{pricePerM2}</p>
          <p className="text-xs opacity-85">{material}</p>
        </div>
      </div>
    );
  }

  if (template === "clean-card") {
    return (
      <div
        ref={previewRef}
        className="grid aspect-[16/9] w-full grid-cols-[1.2fr_1fr] gap-3 rounded border border-neutral-200 bg-[#f6f4ef] p-3"
      >
        <div className="overflow-hidden border-2 border-[#c6c1b1] bg-white">
          <img src={heroSrc} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-col border border-neutral-200 bg-white p-4">
          <img src="/brand/logo-anthracite.png" alt="" className="w-28" />
          <div className="mt-3 rounded bg-[#f3efe6] px-3 py-1 text-xs font-semibold uppercase text-[#5f4a35]">
            {specialOfferText}
          </div>
          <div className="mt-3 border-l-4 border-[#7c5a3a] pl-3">
            <p className="text-base font-semibold uppercase text-neutral-900">{title}</p>
            <p className="text-xs text-neutral-700">{material}</p>
          </div>
          <div className="mt-3 h-28 w-20 overflow-hidden border border-neutral-200">
            <img src={tileSrc} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="mt-auto border-t border-neutral-200 pt-3">
            <p className="text-xs uppercase text-[#7c5a3a]">Precio especial</p>
            <p className="text-2xl font-semibold text-neutral-900">{pricePerM2}</p>
          </div>
        </div>
      </div>
    );
  }

  if (template === "hero-focus") {
    return (
      <div
        ref={previewRef}
        className="relative aspect-[16/9] w-full overflow-hidden rounded border border-neutral-200 bg-black"
      >
        <img src={heroSrc} alt="" className="h-full w-full object-cover opacity-85" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
        <div className="absolute left-4 top-4">
          <img src="/brand/logo-white.png" alt="" className="w-28" />
        </div>
        <div className="absolute right-4 top-4 rounded bg-[#f3efe6] px-3 py-1 text-xs font-semibold uppercase text-[#5f4a35]">
          {specialOfferText}
        </div>
        <div className="absolute bottom-4 left-4 rounded bg-black/50 px-4 py-3 text-white">
          <p className="text-2xl font-semibold uppercase">{title}</p>
          <p className="text-base">{pricePerM2}</p>
          <p className="text-xs opacity-85">{material}</p>
        </div>
        <div className="absolute bottom-4 right-4 h-28 w-16 overflow-hidden border-2 border-white/85">
          <img src={tileSrc} alt="" className="h-full w-full object-cover" />
        </div>
      </div>
    );
  }

  if (template === "catalog-strip") {
    return (
      <div
        ref={previewRef}
        className="relative aspect-[16/9] w-full overflow-hidden rounded border border-neutral-200 bg-[#f6f4ef]"
      >
        <div className="absolute inset-x-0 top-0 h-9 bg-[#c6c1b1]" />
        <div className="absolute left-4 top-2">
          <img src="/brand/logo-anthracite.png" alt="" className="w-24" />
        </div>
        <div className="absolute right-4 top-2 rounded bg-[#f3efe6] px-3 py-1 text-[10px] font-semibold uppercase text-[#5f4a35]">
          {specialOfferText}
        </div>
        <div className="absolute left-4 top-12 h-[65%] w-[74%] overflow-hidden border border-neutral-200 bg-white">
          <img src={heroSrc} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="absolute right-4 top-12 h-[65%] w-[14%] overflow-hidden border border-neutral-200 bg-white">
          <img src={tileSrc} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-x-4 bottom-3 border-t border-[#ddd5c7] pt-2">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-lg font-semibold uppercase text-neutral-900">{title}</p>
              <p className="text-xs text-neutral-600">{material}</p>
            </div>
            <p className="text-2xl font-semibold text-neutral-900">{pricePerM2}</p>
          </div>
        </div>
      </div>
    );
  }

  if (template === "minimal-price") {
    return (
      <div
        ref={previewRef}
        className="relative aspect-[16/9] w-full overflow-hidden rounded border border-neutral-200 bg-white"
      >
        <div className="absolute inset-y-0 left-0 w-[64%] overflow-hidden">
          <img src={heroSrc} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-y-0 right-0 w-[36%] bg-[#c6c1b1] p-4">
          <img src="/brand/logo-anthracite.png" alt="" className="w-24" />
          <div className="mt-3 inline-block rounded bg-[#f3efe6] px-3 py-1 text-[10px] font-semibold uppercase text-[#5f4a35]">
            {specialOfferText}
          </div>
          <div className="mt-3 h-36 w-20 overflow-hidden border border-neutral-200 bg-white">
            <img src={tileSrc} alt="" className="h-full w-full object-cover" />
          </div>
          <p className="mt-3 text-base font-semibold uppercase leading-tight text-neutral-900">{title}</p>
          <p className="text-xs text-neutral-700">{material}</p>
          <div className="mt-3 rounded bg-black px-3 py-1 text-center text-xl font-semibold text-white">
            {pricePerM2}
          </div>
        </div>
      </div>
    );
  }

  if (template === "price-banner") {
    return (
      <div
        ref={previewRef}
        className="relative aspect-[16/9] w-full overflow-hidden rounded border border-neutral-200 bg-white"
      >
        <img src={heroSrc} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-x-0 top-0 h-10 bg-black/72" />
        <div className="absolute left-4 top-2">
          <img src="/brand/logo-white.png" alt="" className="w-24" />
        </div>
        <div className="absolute right-4 top-2 rounded bg-[#f3efe6] px-3 py-1 text-[10px] font-semibold uppercase text-[#5f4a35]">
          {specialOfferText}
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-[#111]/84 px-4 py-3 text-white">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xl font-semibold uppercase">{title}</p>
              <p className="text-xs opacity-90">{material}</p>
            </div>
            <p className="text-3xl font-semibold">{pricePerM2}</p>
          </div>
        </div>
      </div>
    );
  }

  if (template === "duo-frame") {
    return (
      <div
        ref={previewRef}
        className="relative aspect-[16/9] w-full overflow-hidden rounded border border-neutral-200 bg-[#f6f4ef]"
      >
        <div className="absolute left-3 top-3 h-[67%] w-[59%] overflow-hidden border-4 border-[#c6c1b1]">
          <img src={heroSrc} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="absolute left-[51%] top-[45%] z-10 h-[47%] w-[23%] overflow-hidden border-4 border-white shadow-xl">
          <img src={tileSrc} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="absolute right-3 top-3 w-[27%] rounded bg-white/95 p-3">
          <img src="/brand/logo-anthracite.png" alt="" className="w-24" />
          <div className="mt-2 rounded bg-[#f3efe6] px-2 py-1 text-[10px] font-semibold uppercase text-[#5f4a35]">
            {specialOfferText}
          </div>
          <p className="mt-3 text-lg font-semibold uppercase text-neutral-900">{title}</p>
          <p className="text-xs text-neutral-600">{material}</p>
          <p className="mt-2 text-2xl font-semibold text-neutral-900">{pricePerM2}</p>
        </div>
      </div>
    );
  }

  if (template === "editorial-left") {
    return (
      <div
        ref={previewRef}
        className="relative aspect-[16/9] w-full overflow-hidden rounded border border-neutral-200 bg-[#c6c1b1]"
      >
        <div className="absolute left-3 top-3 w-[28%] rounded bg-white p-3">
          <img src="/brand/logo-anthracite.png" alt="" className="w-24" />
          <div className="mt-2 rounded bg-[#f3efe6] px-2 py-1 text-[10px] font-semibold uppercase text-[#5f4a35]">
            {specialOfferText}
          </div>
          <p className="mt-3 text-lg font-semibold uppercase leading-tight text-neutral-900">{title}</p>
          <p className="text-xs text-neutral-600">{material}</p>
          <div className="mt-3 rounded bg-black px-2 py-1 text-center text-xl font-semibold text-white">{pricePerM2}</div>
        </div>
        <div className="absolute left-[32%] top-3 h-[89%] w-[66%] overflow-hidden border-4 border-[#f0ece2]">
          <img src={heroSrc} alt="" className="h-full w-full object-cover" />
        </div>
      </div>
    );
  }

  if (template === "tile-dominant") {
    return (
      <div
        ref={previewRef}
        className="relative aspect-[16/9] w-full overflow-hidden rounded border border-neutral-200 bg-white"
      >
        <div className="absolute left-3 top-3 h-[89%] w-[36%] overflow-hidden border border-neutral-200 bg-[#f6f4ef]">
          <img src={tileSrc} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="absolute left-[40%] top-3 h-[53%] w-[58%] overflow-hidden border border-neutral-200">
          <img src={heroSrc} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="absolute left-[40%] top-[58%] w-[58%] rounded bg-[#f6f4ef] p-3">
          <img src="/brand/logo-anthracite.png" alt="" className="w-24" />
          <div className="mt-2 flex items-start justify-between gap-2">
            <div>
              <p className="text-lg font-semibold uppercase leading-tight text-neutral-900">{title}</p>
              <p className="text-xs text-neutral-600">{material}</p>
            </div>
            <div className="rounded bg-[#f3efe6] px-2 py-1 text-[10px] font-semibold uppercase text-[#5f4a35]">
              {specialOfferText}
            </div>
          </div>
          <p className="mt-2 text-2xl font-semibold text-neutral-900">{pricePerM2}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={previewRef}
      className="relative aspect-[16/9] w-full overflow-hidden rounded border border-neutral-200 bg-[#c6c1b1]"
    >
      <div className="absolute left-3 top-3 h-[88%] w-[75%] overflow-hidden border-4 border-[#f2eee6] bg-[#ded8cb]">
        <img src={heroSrc} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="absolute right-3 top-3 h-[88%] w-[21%] rounded bg-white/92 p-2">
        <div className="rounded bg-[#f3efe6] px-2 py-1 text-[10px] font-semibold uppercase text-[#5f4a35]">
          {specialOfferText}
        </div>
        <div className="mt-2 h-[58%] overflow-hidden border border-neutral-200">
          <img src={tileSrc} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="mt-2 text-[11px] leading-tight text-neutral-800">
          <p className="font-semibold uppercase">{title}</p>
          <p>{pricePerM2}</p>
          <p className="opacity-80">{material}</p>
        </div>
      </div>
      <div className="absolute left-5 top-5">
        <img src="/brand/logo-white.png" alt="" className="w-24" />
      </div>
    </div>
  );
}

export function OffersBuilder() {
  const [heroSrc, setHeroSrc] = useState("/catalog/placeholder-hero.svg");
  const [tileSrc, setTileSrc] = useState("/catalog/placeholder-tile.svg");
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
