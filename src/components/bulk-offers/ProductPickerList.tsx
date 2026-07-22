"use client";

import { useMemo, useState } from "react";
import type { BulkOfferProductRow } from "@/lib/bulk-offers-types";
import { productRowToLine } from "@/lib/bulk-offers-types";

type Props = {
  rows: BulkOfferProductRow[];
  materials: string[];
  onAddLine: (line: ReturnType<typeof productRowToLine>) => void;
};

type SortOption = "name-asc" | "name-desc" | "material" | "format-asc";

export function ProductPickerList({ rows, materials, onAddLine }: Props) {
  const [search, setSearch] = useState("");
  const [materialFilter, setMaterialFilter] = useState("");
  const [includeDrafts, setIncludeDrafts] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");

  const filteredRows = useMemo(() => {
    let result = rows;
    if (!includeDrafts) {
      result = result.filter((row) => row.seriesStatus === "published" && row.formatMaterialStatus === "published");
    }
    if (materialFilter) {
      result = result.filter((row) => row.material === materialFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (row) =>
          row.seriesName.toLowerCase().includes(q) ||
          row.material.toLowerCase().includes(q) ||
          row.formatLabel.toLowerCase().includes(q),
      );
    }
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "name-desc":
          return b.seriesName.localeCompare(a.seriesName, "es");
        case "material":
          return a.material.localeCompare(b.material, "es");
        case "format-asc":
          return a.formatLabel.localeCompare(b.formatLabel, "es");
        default:
          return a.seriesName.localeCompare(b.seriesName, "es");
      }
    });
    return result;
  }, [rows, search, materialFilter, includeDrafts, sortBy]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar serie, material o formato..."
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-[var(--practika-primary)]"
          />
          <select
            value={materialFilter}
            onChange={(e) => setMaterialFilter(e.target.value)}
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-[var(--practika-primary)]"
          >
            <option value="">Todos los materiales</option>
            {materials.map((material) => (
              <option key={material} value={material}>
                {material}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-[var(--practika-primary)]"
          >
            <option value="name-asc">Nombre A-Z</option>
            <option value="name-desc">Nombre Z-A</option>
            <option value="material">Material</option>
            <option value="format-asc">Formato</option>
          </select>
          <label className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={includeDrafts}
              onChange={(e) => setIncludeDrafts(e.target.checked)}
              className="rounded border-neutral-300"
            />
            Incluir borradores
          </label>
        </div>
        <p className="mt-3 text-sm text-neutral-500">{filteredRows.length} resultados</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div className="hidden border-b border-neutral-200 bg-neutral-50 px-4 py-3 md:grid md:grid-cols-12 md:gap-3">
          <div className="col-span-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Serie</div>
          <div className="col-span-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Material</div>
          <div className="col-span-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Formato</div>
          <div className="col-span-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Color</div>
          <div className="col-span-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">Oferta</div>
        </div>
        <div className="divide-y divide-neutral-100">
          {filteredRows.map((row) => (
            <ProductPickerRow key={`${row.formatMaterialId}`} row={row} onAddLine={onAddLine} />
          ))}
        </div>
        {filteredRows.length === 0 ? (
          <div className="px-4 py-16 text-center text-sm text-neutral-500">No hay productos con estos filtros.</div>
        ) : null}
      </div>
    </div>
  );
}

function ProductPickerRow({
  row,
  onAddLine,
}: {
  row: BulkOfferProductRow;
  onAddLine: Props["onAddLine"];
}) {
  const [selectedColorId, setSelectedColorId] = useState(row.colors[0]?.id || "");
  const [squareMeters, setSquareMeters] = useState("");
  const [pricePerM2, setPricePerM2] = useState("");
  const [comments, setComments] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedColor = row.colors.find((c) => c.id === selectedColorId) || row.colors[0];
  const isDraft = row.seriesStatus !== "published" || row.formatMaterialStatus !== "published";

  function handleAdd() {
    const m2 = Number(squareMeters.replace(",", "."));
    const price = Number(pricePerM2.replace(",", "."));
    if (!selectedColor || !Number.isFinite(m2) || m2 <= 0 || !Number.isFinite(price) || price < 0) return;
    onAddLine(productRowToLine(row, selectedColor, m2, price, comments.trim()));
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1200);
    setSquareMeters("");
    setPricePerM2("");
    setComments("");
  }

  return (
    <div className="px-4 py-4 hover:bg-neutral-50/70">
      <div className="grid gap-4 md:grid-cols-12 md:items-center">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-neutral-900">{row.seriesName}</p>
            {isDraft ? (
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-800">
                Borrador
              </span>
            ) : null}
          </div>
        </div>
        <div className="md:col-span-2 text-sm text-neutral-600">{row.material}</div>
        <div className="md:col-span-2 text-sm font-medium text-neutral-900">{row.formatDisplay}</div>
        <div className="md:col-span-2">
          {row.colors.length ? (
            <div className="flex items-center gap-2">
              {selectedColor?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selectedColor.image} alt="" className="h-10 w-10 rounded border border-neutral-200 object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded border border-dashed border-neutral-300 text-[10px] text-neutral-400">
                  Sin foto
                </div>
              )}
              <select
                value={selectedColorId}
                onChange={(e) => setSelectedColorId(e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-neutral-200 px-2 py-1.5 text-sm outline-none focus:border-[var(--practika-primary)]"
              >
                {row.colors.map((color) => (
                  <option key={color.id} value={color.id}>
                    {color.name}
                    {color.status !== "published" ? " (borrador)" : ""}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <span className="text-sm text-neutral-400">Sin colores</span>
          )}
        </div>
        <div className="md:col-span-4">
          <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
            <input
              value={squareMeters}
              onChange={(e) => setSquareMeters(e.target.value)}
              placeholder="m²"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-[var(--practika-primary)] xl:w-24"
            />
            <input
              value={pricePerM2}
              onChange={(e) => setPricePerM2(e.target.value)}
              placeholder="€/m²"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-[var(--practika-primary)] xl:w-24"
            />
            <input
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Comentarios / características"
              className="min-w-0 flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-[var(--practika-primary)]"
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={!row.colors.length}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white transition ${
                showSuccess ? "bg-green-600" : "bg-[var(--practika-primary)] hover:bg-[var(--practika-primary-light)]"
              } disabled:cursor-not-allowed disabled:bg-neutral-300`}
              title="Añadir a la oferta"
            >
              {showSuccess ? "✓" : "+"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
