"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { BulkOfferSummary } from "@/lib/bulk-offers-types";
import { bulkOfferExportUrl, type BulkOfferLineSortMode } from "@/lib/bulk-offer-line-sort";
import { BulkOfferLineSortSelect } from "@/components/bulk-offers/BulkOfferLineSortSelect";
import { BulkOfferPdfMenu } from "@/components/bulk-offers/BulkOfferPdfMenu";

const DEFAULT_EXPORT_SORT: BulkOfferLineSortMode = "series";

export function SavedOffersTable() {
  const [offers, setOffers] = useState<BulkOfferSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortByOffer, setSortByOffer] = useState<Record<string, BulkOfferLineSortMode>>({});

  function getOfferSort(offerId: string): BulkOfferLineSortMode {
    return sortByOffer[offerId] ?? DEFAULT_EXPORT_SORT;
  }

  function setOfferSort(offerId: string, sort: BulkOfferLineSortMode) {
    setSortByOffer((prev) => ({ ...prev, [offerId]: sort }));
  }

  async function loadOffers() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/bulk-offers");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudieron cargar las ofertas");
      setOffers(data.offers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOffers();
  }, []);

  async function deleteOffer(id: string, name: string) {
    if (!window.confirm(`¿Eliminar la oferta "${name}"?`)) return;
    const res = await fetch(`/api/bulk-offers/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "No se pudo eliminar");
      return;
    }
    setOffers((prev) => prev.filter((offer) => offer.id !== id));
    setSortByOffer((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  if (loading) return <p className="text-sm text-neutral-500">Cargando ofertas...</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-200 px-4 py-4">
        <h2 className="text-lg font-semibold text-neutral-900">Ofertas guardadas</h2>
        <p className="mt-1 text-sm text-neutral-500">Historial de ofertas masivas creadas por el equipo.</p>
      </div>
      {offers.length === 0 ? (
        <div className="px-4 py-16 text-center text-sm text-neutral-500">
          Todavía no hay ofertas guardadas.{" "}
          <Link href="/ofertas-masivas" className="font-medium text-[var(--practika-primary)] hover:underline">
            Crear la primera
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Líneas</th>
                <th className="px-4 py-3">Autor</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {offers.map((offer) => {
                const sort = getOfferSort(offer.id);
                return (
                  <tr key={offer.id} className="hover:bg-neutral-50/70">
                    <td className="px-4 py-3 font-medium text-neutral-900">{offer.name}</td>
                    <td className="px-4 py-3 text-neutral-600">
                      {new Date(offer.createdAt).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{offer.lineCount}</td>
                    <td className="px-4 py-3 text-neutral-600">{offer.createdBy}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/ofertas-masivas/${offer.id}`}
                          className="rounded-lg border border-neutral-200 px-3 py-1.5 hover:bg-neutral-50"
                        >
                          Editar
                        </Link>
                        <BulkOfferLineSortSelect
                          value={sort}
                          onChange={(value) => setOfferSort(offer.id, value)}
                          compact
                        />
                        <a
                          href={bulkOfferExportUrl(offer.id, "excel", { sort })}
                          className="rounded-lg border border-neutral-200 px-3 py-1.5 hover:bg-neutral-50"
                        >
                          Excel
                        </a>
                        <BulkOfferPdfMenu
                          offerId={offer.id}
                          sort={sort}
                          buttonClassName="rounded-lg border border-neutral-200 px-3 py-1.5 hover:bg-neutral-50"
                        />
                        <button
                          type="button"
                          onClick={() => deleteOffer(offer.id, offer.name)}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-red-600 hover:bg-red-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
