"use client";

import { useCallback, useEffect, useState } from "react";
import type { BulkOfferDetail, BulkOfferLineDraft, BulkOfferProductRow } from "@/lib/bulk-offers-types";
import { bulkOfferExportUrl, type BulkOfferLineSortMode } from "@/lib/bulk-offer-line-sort";
import { OfferLinesPanel } from "@/components/bulk-offers/OfferLinesPanel";
import { ProductPickerList } from "@/components/bulk-offers/ProductPickerList";

type Props = {
  initialOffer?: BulkOfferDetail | null;
};

export function BulkOffersBuilder({ initialOffer }: Props) {
  const [rows, setRows] = useState<BulkOfferProductRow[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);
  const [lines, setLines] = useState<BulkOfferLineDraft[]>(initialOffer?.lines || []);
  const [offerName, setOfferName] = useState(initialOffer?.name || "");
  const [offerId, setOfferId] = useState<string | undefined>(initialOffer?.id);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadProducts() {
      setLoadingProducts(true);
      setProductError(null);
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "No se pudieron cargar los productos");
        if (!cancelled) {
          setRows(data.rows || []);
          setMaterials(data.materials || []);
        }
      } catch (error) {
        if (!cancelled) setProductError(error instanceof Error ? error.message : "Error inesperado");
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    }
    loadProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  const addLine = useCallback((line: BulkOfferLineDraft) => {
    setLines((prev) => [...prev, line]);
  }, []);

  async function saveOffer() {
    setSaving(true);
    setMessage(null);
    try {
      const payload = { name: offerName.trim(), lines };
      const res = await fetch(offerId ? `/api/bulk-offers/${offerId}` : "/api/bulk-offers", {
        method: offerId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo guardar la oferta");
      setOfferId(data.offer.id);
      setLines(data.offer.lines);
      setMessage("Oferta guardada correctamente");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  function exportFile(kind: "excel", sort: BulkOfferLineSortMode) {
    if (!offerId) {
      setMessage("Guarda la oferta antes de exportar");
      return;
    }
    window.location.href = bulkOfferExportUrl(offerId, kind, { sort });
  }

  return (
    <div className="space-y-6">
      {message ? (
        <div className="rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700">{message}</div>
      ) : null}

      <OfferLinesPanel
        lines={lines}
        offerName={offerName}
        onOfferNameChange={setOfferName}
        onLinesChange={setLines}
        onSave={saveOffer}
        onExportExcel={(sort) => exportFile("excel", sort)}
        saving={saving}
        offerId={offerId}
      />

      <div>
        <h2 className="mb-3 text-lg font-semibold text-neutral-900">Catálogo CRM</h2>
        {loadingProducts ? <p className="text-sm text-neutral-500">Cargando productos...</p> : null}
        {productError ? <p className="text-sm text-red-600">{productError}</p> : null}
        {!loadingProducts && !productError ? (
          <ProductPickerList rows={rows} materials={materials} onAddLine={addLine} />
        ) : null}
      </div>
    </div>
  );
}
