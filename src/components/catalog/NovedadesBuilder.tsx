"use client";
/* eslint-disable @next/next/no-img-element */

import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import { useMemo, useRef, useState } from "react";

type BuilderProduct = {
  name: string;
  material: string;
  format: string;
  image: string;
};

const emptyImage = "/catalog/placeholder-tile.svg";
const coverDefault = "/catalog/placeholder-hero.svg";

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
      className="w-full rounded border border-dashed border-neutral-300 bg-white p-3 text-left hover:bg-neutral-50"
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
      <p className="text-sm font-medium text-neutral-800">{label}</p>
      <p className="mt-1 text-xs text-neutral-500">Arrastra o haz click</p>
    </button>
  );
}

function PageShell({
  children,
  pageRef,
}: {
  children: React.ReactNode;
  pageRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={pageRef}
      className="relative mx-auto aspect-[210/297] w-full max-w-[380px] overflow-hidden border border-neutral-200 bg-[#c6c1b1]"
    >
      {children}
    </div>
  );
}

export function NovedadesBuilder() {
  const [title, setTitle] = useState("NOVEDADES");
  const [subtitle, setSubtitle] = useState("Practika Ceramica");
  const [season, setSeason] = useState("Primavera 2026");
  const [heading, setHeading] = useState("Coleccion");
  const [body, setBody] = useState(
    "Texto corto de introduccion de coleccion. Puedes editar este texto para cada campana.",
  );
  const [coverImage, setCoverImage] = useState(coverDefault);

  const [products, setProducts] = useState<BuilderProduct[]>([
    { name: "Bambu", material: "Pasta roja", format: "30x60", image: emptyImage },
    { name: "Binibeca", material: "Pasta roja", format: "30x60", image: emptyImage },
    { name: "Nassau", material: "Pasta roja", format: "33,3x33,3", image: emptyImage },
    { name: "Pool", material: "Pasta roja", format: "33,3x33,3", image: emptyImage },
    { name: "Bahamas", material: "Pasta roja", format: "33,3x33,3", image: emptyImage },
    { name: "Blue Sea", material: "Pasta roja", format: "33,3x33,3", image: emptyImage },
  ]);

  const pagesByGrid = useMemo(() => {
    const chunkSize = 6;
    const out: BuilderProduct[][] = [];
    for (let i = 0; i < products.length; i += chunkSize) out.push(products.slice(i, i + chunkSize));
    return out;
  }, [products]);

  const coverRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const gridRefs = useRef<(HTMLDivElement | null)[]>([]);

  async function exportNodePng(node: HTMLElement, filename: string) {
    const dataUrl = await toPng(node, { pixelRatio: 2 });
    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    link.click();
  }

  async function exportNodePdf(node: HTMLElement, filename: string) {
    const dataUrl = await toPng(node, { pixelRatio: 2 });
    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    pdf.addImage(dataUrl, "PNG", 0, 0, 595.28, 841.89);
    pdf.save(filename);
  }

  async function downloadFullCatalogPdf() {
    const nodes = [coverRef.current, sectionRef.current, ...gridRefs.current].filter(
      Boolean,
    ) as HTMLElement[];
    if (!nodes.length) return;

    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    for (let i = 0; i < nodes.length; i += 1) {
      const dataUrl = await toPng(nodes[i], { pixelRatio: 2 });
      if (i > 0) pdf.addPage("a4", "portrait");
      pdf.addImage(dataUrl, "PNG", 0, 0, 595.28, 841.89);
    }
    pdf.save("practika-novedades-catalogo.pdf");
  }

  return (
    <div className="mx-auto max-w-[1300px] space-y-6 px-6 py-8">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Creador visual de novedades</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Edita portada, texto y productos. Descarga PNG/PDF por pagina o el catalogo completo.
        </p>
      </div>

      <div className="grid gap-4 rounded border border-neutral-200 bg-neutral-50 p-4 md:grid-cols-2">
        <DropZone label="Imagen portada" onFile={async (f) => setCoverImage(await fileToDataUrl(f))} />
        <div className="flex items-end">
          <button
            type="button"
            className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
            onClick={downloadFullCatalogPdf}
          >
            Descargar catalogo completo en PDF
          </button>
        </div>
        <input className="rounded border border-neutral-300 bg-white px-3 py-2 text-sm" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titulo portada" />
        <input className="rounded border border-neutral-300 bg-white px-3 py-2 text-sm" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Subtitulo portada" />
        <input className="rounded border border-neutral-300 bg-white px-3 py-2 text-sm" value={season} onChange={(e) => setSeason(e.target.value)} placeholder="Temporada" />
        <input className="rounded border border-neutral-300 bg-white px-3 py-2 text-sm" value={heading} onChange={(e) => setHeading(e.target.value)} placeholder="Titulo seccion" />
        <textarea className="md:col-span-2 rounded border border-neutral-300 bg-white px-3 py-2 text-sm" rows={2} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Texto de seccion" />
      </div>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-700">Portada</h2>
          <div className="flex gap-2">
            <button className="rounded bg-neutral-900 px-3 py-2 text-xs font-medium text-white" onClick={() => coverRef.current && exportNodePng(coverRef.current, "novedades-portada.png")}>Descargar PNG</button>
            <button className="rounded border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-900" onClick={() => coverRef.current && exportNodePdf(coverRef.current, "novedades-portada.pdf")}>Descargar PDF</button>
          </div>
        </div>
        <PageShell pageRef={coverRef}>
          <div className="pt-6 text-center">
            <img src="/brand/logo-white.png" alt="" className="mx-auto w-44" />
          </div>
          <div className="mx-5 mt-6 h-[63%] overflow-hidden border-[6px] border-[#f2eee7]">
            <img src={coverImage} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="mt-4 text-center text-[#f3f1ec]">
            <p className="text-3xl font-semibold uppercase tracking-[0.3em]">{title}</p>
            <p className="mt-1 text-sm tracking-[0.12em]">{subtitle}</p>
            <p className="mt-6 text-xs uppercase tracking-[0.2em]">{season}</p>
          </div>
        </PageShell>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-700">Seccion</h2>
          <div className="flex gap-2">
            <button className="rounded bg-neutral-900 px-3 py-2 text-xs font-medium text-white" onClick={() => sectionRef.current && exportNodePng(sectionRef.current, "novedades-seccion.png")}>Descargar PNG</button>
            <button className="rounded border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-900" onClick={() => sectionRef.current && exportNodePdf(sectionRef.current, "novedades-seccion.pdf")}>Descargar PDF</button>
          </div>
        </div>
        <PageShell pageRef={sectionRef}>
          <div className="pt-5 text-center">
            <img src="/brand/logo-white.png" alt="" className="mx-auto w-44" />
          </div>
          <div className="relative mt-5 h-[67%]">
            <p className="absolute left-3 top-1/2 -translate-y-1/2 -rotate-90 text-2xl uppercase tracking-[0.2em] text-black/85">
              {heading}
            </p>
            <div className="absolute left-20 top-2 h-[85%] w-[63%] overflow-hidden border-[6px] border-[#f2eee7] bg-[#ded8cb]">
              <img src={coverImage} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="absolute left-[45%] top-[58%] z-10 h-[34%] w-[45%] overflow-hidden border-[6px] border-white bg-[#ded8cb]">
              <img src="/catalog/placeholder-tile.svg" alt="" className="h-full w-full object-cover" />
            </div>
          </div>
          <p className="mx-10 mt-2 text-xs text-black/70">{body}</p>
        </PageShell>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-700">Productos</h2>
          <button
            className="rounded border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-900"
            onClick={() =>
              setProducts((prev) => [
                ...prev,
                { name: "Nuevo producto", material: "", format: "", image: emptyImage },
              ])
            }
          >
            Anadir producto
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <div key={`${p.name}-${i}`} className="space-y-2 rounded border border-neutral-200 bg-white p-3">
              <DropZone
                label={`Imagen producto ${i + 1}`}
                onFile={async (f) => {
                  const imageDataUrl = await fileToDataUrl(f);
                  setProducts((prev) =>
                    prev.map((it, idx) => (idx === i ? { ...it, image: imageDataUrl } : it)),
                  );
                }}
              />
              <input className="w-full rounded border border-neutral-300 px-2 py-1 text-sm" value={p.name} onChange={(e) => setProducts((prev) => prev.map((it, idx) => (idx === i ? { ...it, name: e.target.value } : it)))} placeholder="Nombre" />
              <input className="w-full rounded border border-neutral-300 px-2 py-1 text-sm" value={p.material} onChange={(e) => setProducts((prev) => prev.map((it, idx) => (idx === i ? { ...it, material: e.target.value } : it)))} placeholder="Material" />
              <input className="w-full rounded border border-neutral-300 px-2 py-1 text-sm" value={p.format} onChange={(e) => setProducts((prev) => prev.map((it, idx) => (idx === i ? { ...it, format: e.target.value } : it)))} placeholder="Formato" />
              <button
                className="rounded border border-red-300 px-2 py-1 text-xs text-red-700"
                onClick={() => setProducts((prev) => prev.filter((_, idx) => idx !== i))}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        {pagesByGrid.map((chunk, pageIndex) => (
          <div key={`grid-page-${pageIndex}`} className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-700">
                Pagina productos {pageIndex + 1}
              </h3>
              <div className="flex gap-2">
                <button
                  className="rounded bg-neutral-900 px-3 py-2 text-xs font-medium text-white"
                  onClick={() =>
                    gridRefs.current[pageIndex] &&
                    exportNodePng(gridRefs.current[pageIndex]!, `novedades-productos-${pageIndex + 1}.png`)
                  }
                >
                  Descargar PNG
                </button>
                <button
                  className="rounded border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-900"
                  onClick={() =>
                    gridRefs.current[pageIndex] &&
                    exportNodePdf(gridRefs.current[pageIndex]!, `novedades-productos-${pageIndex + 1}.pdf`)
                  }
                >
                  Descargar PDF
                </button>
              </div>
            </div>
            <PageShell
              pageRef={{
                get current() {
                  return gridRefs.current[pageIndex] ?? null;
                },
                set current(value: HTMLDivElement | null) {
                  gridRefs.current[pageIndex] = value;
                },
              }}
            >
              <div className="pt-5 text-center">
                <img src="/brand/logo-white.png" alt="" className="mx-auto w-40" />
              </div>
              <div className="mx-5 mt-4 border-y border-white/80 py-2 text-center">
                <p className="text-sm uppercase tracking-[0.28em] text-black/80">Novedades</p>
              </div>
              <div className="mx-5 mt-3 grid grid-cols-3 gap-2">
                {chunk.map((prod, idx) => (
                  <article key={`${prod.name}-${idx}`} className="bg-[#e5e0d3] p-1.5">
                    <div className="aspect-square overflow-hidden border border-white/90 bg-neutral-100">
                      <img src={prod.image} alt={prod.name} className="h-full w-full object-cover" />
                    </div>
                    <p className="mt-1 text-[10px] font-semibold uppercase leading-tight text-black/90">{prod.name}</p>
                    {prod.material ? <p className="text-[9px] text-black/70">{prod.material}</p> : null}
                    {prod.format ? <p className="text-[9px] uppercase text-black/60">{prod.format}</p> : null}
                  </article>
                ))}
              </div>
            </PageShell>
          </div>
        ))}
      </section>
    </div>
  );
}
