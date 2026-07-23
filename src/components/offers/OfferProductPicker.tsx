"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import type { BulkOfferColorOption, BulkOfferProductRow } from "@/lib/bulk-offers-types";

export type OfferProductSelection = {
  seriesName: string;
  seriesSlug: string;
  material: string;
  formatLabel: string;
  colorName: string;
  tileImageUrl: string;
};

type Props = {
  rows: BulkOfferProductRow[];
  materials: string[];
  onSelect: (selection: OfferProductSelection) => void;
};

type SortOption = "name-asc" | "name-desc" | "material" | "format-asc";

export function OfferProductPicker({ rows, materials, onSelect }: Props) {
  const [search, setSearch] = useState("");
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [includeDrafts, setIncludeDrafts] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [collapsed, setCollapsed] = useState(false);

  const filteredRows = useMemo(() => {
    let result = rows;
    if (!includeDrafts) {
      result = result.filter((row) => row.seriesStatus === "published" && row.formatMaterialStatus === "published");
    }
    if (selectedMaterials.length > 0) {
      const selected = new Set(selectedMaterials);
      result = result.filter((row) => selected.has(row.material));
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
  }, [rows, search, selectedMaterials, includeDrafts, sortBy]);

  function handleSelect(selection: OfferProductSelection) {
    onSelect(selection);
    setCollapsed(true);
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="sticky top-0 z-20 bg-white">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 px-4 py-4">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">Buscar producto del CRM</h2>
            <p className="mt-1 text-xs text-neutral-500">
              Elige serie, material, formato y color. Se cargarán la imagen del color y las fotos de ambiente.
            </p>
            {collapsed ? (
              <p className="mt-2 text-sm text-neutral-500">
                {filteredRows.length} productos disponibles · Oculto para editar la oferta manualmente
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="shrink-0 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
          >
            {collapsed ? "Mostrar productos" : "Ocultar productos"}
          </button>
        </div>

        {!collapsed ? (
          <div className="border-b border-neutral-200 bg-white px-4 pb-4 pt-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar serie, material o formato..."
                className="rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-[var(--practika-primary)]"
              />
              <MaterialMultiSelect materials={materials} selected={selectedMaterials} onChange={setSelectedMaterials} />
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
            <p className="mt-4 text-sm text-neutral-500">{filteredRows.length} resultados</p>

            <div className="mt-3 hidden border border-neutral-200 border-b-0 bg-neutral-50 md:grid md:grid-cols-12 md:gap-3 md:rounded-t-xl md:py-3">
              <div className="col-span-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Serie</div>
              <div className="col-span-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Material</div>
              <div className="col-span-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Formato</div>
              <div className="col-span-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Color</div>
              <div className="col-span-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Acción</div>
            </div>
          </div>
        ) : null}
      </div>

      {!collapsed ? (
        <div className="border-b border-neutral-200">
          <div className="divide-y divide-neutral-100">
            {filteredRows.map((row) => (
              <OfferProductPickerRow key={row.formatMaterialId} row={row} onSelect={handleSelect} />
            ))}
          </div>
          {filteredRows.length === 0 ? (
            <div className="px-4 py-16 text-center text-sm text-neutral-500">No hay productos con estos filtros.</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function MaterialMultiSelect({
  materials,
  selected,
  onChange,
}: {
  materials: string[];
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const label =
    selected.length === 0
      ? "Todos los materiales"
      : selected.length === 1
        ? selected[0]
        : `${selected.length} materiales`;

  function toggleMaterial(material: string) {
    onChange(selected.includes(material) ? selected.filter((m) => m !== material) : [...selected, material]);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-neutral-200 bg-white px-3 py-2 text-left text-sm outline-none focus:border-[var(--practika-primary)]"
      >
        <span className="truncate">{label}</span>
        <span className="ml-2 text-neutral-400">{open ? "▴" : "▾"}</span>
      </button>

      {open ? (
        <div className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
          <div className="flex items-center justify-between border-b border-neutral-100 px-3 py-2">
            <button
              type="button"
              onClick={() => onChange(materials)}
              className="text-xs font-medium text-[var(--practika-primary)] hover:underline"
            >
              Seleccionar todos
            </button>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs text-neutral-500 hover:underline"
            >
              Limpiar
            </button>
          </div>
          {materials.map((material) => {
            const checked = selected.includes(material);
            return (
              <label
                key={material}
                className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-50 ${
                  checked ? "bg-[var(--practika-highlight)]/60" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleMaterial(material)}
                  className="rounded border-neutral-300 text-[var(--practika-primary)]"
                />
                <span className="truncate">{material}</span>
              </label>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function OfferProductPickerRow({
  row,
  onSelect,
}: {
  row: BulkOfferProductRow;
  onSelect: (selection: OfferProductSelection) => void;
}) {
  const [selectedColorId, setSelectedColorId] = useState(row.colors[0]?.id || "");

  const selectedColor = row.colors.find((c) => c.id === selectedColorId) || row.colors[0];
  const isDraft = row.seriesStatus !== "published" || row.formatMaterialStatus !== "published";

  function handleSelect() {
    if (!selectedColor) return;
    onSelect(buildSelection(row, selectedColor));
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
        <div className="md:col-span-3">
          {row.colors.length ? (
            <ColorSelect row={row} selectedColorId={selectedColorId} onChange={setSelectedColorId} />
          ) : (
            <span className="text-sm text-neutral-400">Sin colores</span>
          )}
        </div>
        <div className="md:col-span-3">
          <button
            type="button"
            onClick={handleSelect}
            disabled={!row.colors.length}
            className="w-full rounded-lg bg-[var(--practika-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--practika-primary-light)] disabled:cursor-not-allowed disabled:bg-neutral-300 md:w-auto"
          >
            Usar producto
          </button>
        </div>
      </div>
    </div>
  );
}

function ColorSelect({
  row,
  selectedColorId,
  onChange,
}: {
  row: BulkOfferProductRow;
  selectedColorId: string;
  onChange: (id: string) => void;
}) {
  const selectedColor = row.colors.find((c) => c.id === selectedColorId) || row.colors[0];

  return (
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
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 rounded-lg border border-neutral-200 px-2 py-1.5 text-sm outline-none focus:border-[var(--practika-primary)]"
      >
        {row.colors.map((color) => (
          <option key={color.id} value={color.id}>
            {color.displayLabel}
            {color.status !== "published" ? " (borrador)" : ""}
          </option>
        ))}
      </select>
    </div>
  );
}

function buildSelection(row: BulkOfferProductRow, color: BulkOfferColorOption): OfferProductSelection {
  return {
    seriesName: row.seriesName,
    seriesSlug: row.seriesSlug,
    material: row.material,
    formatLabel: row.formatLabel,
    colorName: color.displayLabel,
    tileImageUrl: color.image || "",
  };
}
