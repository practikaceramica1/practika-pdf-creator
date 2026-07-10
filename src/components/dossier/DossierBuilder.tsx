"use client";
/* eslint-disable @next/next/no-img-element */

import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DossierSeriesDocument } from "@/components/dossier/DossierSeriesDocument";
import {
  DOSSIER_STORAGE_KEY,
  type CrmSeriesDetail,
  type CrmSeriesSummary,
  type DossierDocument,
  seriesToDossier,
} from "@/lib/dossier-types";

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function DossierBuilder() {
  const [seriesList, setSeriesList] = useState<CrmSeriesSummary[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingSeries, setLoadingSeries] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [doc, setDoc] = useState<DossierDocument | null>(null);
  const [exporting, setExporting] = useState(false);

  const printMountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingList(true);
      setError(null);
      try {
        const res = await fetch("/api/series");
        const data = (await res.json()) as { series?: CrmSeriesSummary[]; error?: string };
        if (!res.ok) throw new Error(data.error || "No se pudo cargar el catálogo");
        if (!cancelled) setSeriesList(data.series || []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error de red");
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredSeries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return seriesList;
    return seriesList.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q) ||
        (s.collection || "").toLowerCase().includes(q),
    );
  }, [search, seriesList]);

  const loadSeries = useCallback(async (slug: string) => {
    setLoadingSeries(true);
    setError(null);
    setSelectedSlug(slug);
    try {
      const res = await fetch(`/api/series?slug=${encodeURIComponent(slug)}`);
      const data = (await res.json()) as { series?: CrmSeriesDetail; error?: string };
      if (!res.ok || !data.series) throw new Error(data.error || "Serie no encontrada");
      const next = seriesToDossier(data.series);
      setDoc(next);
      try {
        sessionStorage.setItem(DOSSIER_STORAGE_KEY, JSON.stringify({ slug, doc: next }));
      } catch {
        /* ignore */
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar la serie");
    } finally {
      setLoadingSeries(false);
    }
  }, []);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DOSSIER_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { slug?: string; doc?: DossierDocument };
      if (parsed.slug) setSelectedSlug(parsed.slug);
      if (parsed.doc) setDoc(parsed.doc);
    } catch {
      /* ignore */
    }
  }, []);

  const updateDoc = useCallback(
    (patch: Partial<DossierDocument>) => {
      setDoc((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...patch };
        try {
          sessionStorage.setItem(
            DOSSIER_STORAGE_KEY,
            JSON.stringify({ slug: selectedSlug, doc: next }),
          );
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [selectedSlug],
  );

  async function downloadPdf() {
    const root = printMountRef.current;
    if (!root || !doc) return;
    setExporting(true);
    try {
      const nodes = root.querySelectorAll<HTMLElement>(".dossier-page");
      if (!nodes.length) return;

      const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const w = 841.89;
      const h = 595.28;

      for (let i = 0; i < nodes.length; i += 1) {
        const dataUrl = await toPng(nodes[i], { pixelRatio: 2, cacheBust: true });
        if (i > 0) pdf.addPage("a4", "landscape");
        pdf.addImage(dataUrl, "PNG", 0, 0, w, h);
      }
      const safeName = doc.seriesName.replace(/[^\w\d\-_.\s]/g, "_").slice(0, 60) || "dossier";
      pdf.save(`practika-dossier-${safeName}.pdf`);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex min-h-full flex-col lg:flex-row">
      <aside className="w-full shrink-0 border-b border-neutral-200 bg-white lg:w-[360px] lg:border-b-0 lg:border-r">
        <div className="space-y-4 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Paso 1</p>
            <h2 className="mt-1 text-lg font-semibold text-neutral-900">Elegir serie (CRM)</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Datos, fotos y filtros técnicos desde Supabase (misma BD que el CRM).
            </p>
          </div>

          <input
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            placeholder="Buscar serie…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="max-h-[220px] overflow-y-auto rounded border border-neutral-200">
            {loadingList ? (
              <p className="p-3 text-sm text-neutral-500">Cargando series…</p>
            ) : filteredSeries.length === 0 ? (
              <p className="p-3 text-sm text-neutral-500">No hay series publicadas.</p>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {filteredSeries.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      className={`w-full px-3 py-2.5 text-left text-sm hover:bg-neutral-50 ${
                        selectedSlug === s.slug ? "bg-amber-50 font-medium text-amber-950" : "text-neutral-800"
                      }`}
                      onClick={() => loadSeries(s.slug)}
                    >
                      {s.name}
                      {s.isNew ? (
                        <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-900">
                          New
                        </span>
                      ) : null}
                      <span className="mt-0.5 block text-xs text-neutral-500">
                        {s.formats.slice(0, 3).join(" · ")}
                        {s.formats.length > 3 ? "…" : ""}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error ? (
            <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
          ) : null}

          {doc ? (
            <>
              <div className="border-t border-neutral-200 pt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Paso 2</p>
                <h2 className="mt-1 text-lg font-semibold text-neutral-900">Ajustar contenido</h2>
              </div>

              <label className="block space-y-1">
                <span className="text-xs font-medium text-neutral-600">Temporada / año</span>
                <input
                  className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
                  value={doc.season}
                  onChange={(e) => updateDoc({ season: e.target.value })}
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-medium text-neutral-600">Texto introducción</span>
                <textarea
                  className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
                  rows={4}
                  value={doc.intro}
                  onChange={(e) => updateDoc({ intro: e.target.value })}
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-medium text-neutral-600">Imagen portada (override)</span>
                <input
                  type="file"
                  accept="image/*"
                  className="text-sm"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (f) updateDoc({ heroImage: await fileToDataUrl(f) });
                  }}
                />
              </label>

              <button
                type="button"
                disabled={exporting || loadingSeries}
                className="w-full rounded bg-[#1a1f3d] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#12162d] disabled:opacity-60"
                onClick={downloadPdf}
              >
                {exporting ? "Generando PDF…" : "Descargar dossier PDF (5 páginas)"}
              </button>
            </>
          ) : null}

          {loadingSeries ? <p className="text-sm text-neutral-500">Cargando serie…</p> : null}
        </div>
      </aside>

      <main className="min-w-0 flex-1 bg-[#fafaf9] p-5">
        {!doc ? (
          <div className="flex min-h-[420px] items-center justify-center rounded border border-dashed border-neutral-300 bg-white p-8 text-center">
            <div>
              <p className="text-lg font-medium text-neutral-800">Selecciona una serie para previsualizar el dossier</p>
              <p className="mt-2 max-w-md text-sm text-neutral-600">
                Portada, ambiente, formatos con siluetas, tabla técnica y colores — listo para enviar a clientes.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900">{doc.seriesName}</h2>
                <p className="text-sm text-neutral-600">5 páginas · A4 apaisado · Practika</p>
              </div>
              <button
                type="button"
                disabled={exporting}
                className="rounded border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 disabled:opacity-60"
                onClick={downloadPdf}
              >
                Descargar PDF
              </button>
            </div>

            <div className="overflow-x-auto rounded border border-neutral-200 bg-neutral-200/60 p-4">
              <div className="origin-top-left scale-[0.45] sm:scale-[0.55] md:scale-[0.65] lg:scale-[0.72]">
                <div className="w-[297mm] shadow-xl">
                  <DossierSeriesDocument doc={doc} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full-size off-screen mount for crisp PDF export */}
        {doc ? (
          <div className="pointer-events-none fixed left-[-10000px] top-0" aria-hidden>
            <div ref={printMountRef}>
              <DossierSeriesDocument doc={doc} />
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
