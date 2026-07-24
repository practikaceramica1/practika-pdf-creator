"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useMemo, useRef, useState } from "react";
import type { BulkOfferLineDraft } from "@/lib/bulk-offers-types";
import {
  type BulkOfferLineSortMode,
  sortBulkOfferLines,
} from "@/lib/bulk-offer-line-sort";
import { BulkOfferLineSortSelect } from "@/components/bulk-offers/BulkOfferLineSortSelect";
import { BulkOfferPdfMenu } from "@/components/bulk-offers/BulkOfferPdfMenu";
import {
  formatDecimalInput,
  isDecimalDraft,
  lineTotal,
  newManualLine,
  parseDecimalInput,
  resolveLineImage,
} from "@/lib/bulk-offers-types";

type Props = {
  lines: BulkOfferLineDraft[];
  offerName: string;
  onOfferNameChange: (value: string) => void;
  onLinesChange: (lines: BulkOfferLineDraft[]) => void;
  onSave: () => Promise<void>;
  onExportExcel: (sort: BulkOfferLineSortMode) => void;
  saving: boolean;
  offerId?: string;
};

export function OfferLinesPanel({
  lines,
  offerName,
  onOfferNameChange,
  onLinesChange,
  onSave,
  onExportExcel,
  saving,
  offerId,
}: Props) {
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualLine, setManualLine] = useState<BulkOfferLineDraft>(() => newManualLine());
  const [manualSquareMeters, setManualSquareMeters] = useState("");
  const [manualPricePerM2, setManualPricePerM2] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const manualFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);
  const [manualImageLoading, setManualImageLoading] = useState(false);
  const [lineImageLoadingId, setLineImageLoadingId] = useState<string | null>(null);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [lineSort, setLineSort] = useState<BulkOfferLineSortMode>("creation");
  const canReorder = lineSort === "creation";

  const displayedLines = useMemo(() => sortBulkOfferLines(lines, lineSort), [lines, lineSort]);
  const lineIds = useMemo(() => displayedLines.map((line) => line.id), [displayedLines]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function updateLine(id: string, patch: Partial<BulkOfferLineDraft>) {
    onLinesChange(lines.map((line) => (line.id === id ? { ...line, ...patch } : line)));
  }

  function removeLine(id: string) {
    onLinesChange(lines.filter((line) => line.id !== id));
  }

  function handleDragEnd(event: DragEndEvent) {
    if (!canReorder) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = lines.findIndex((line) => line.id === active.id);
    const newIndex = lines.findIndex((line) => line.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onLinesChange(arrayMove(lines, oldIndex, newIndex));
  }

  async function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
      reader.readAsDataURL(file);
    });
  }

  async function handleImageUpload(file: File, lineId: string) {
    setImageUploadError(null);
    setLineImageLoadingId(lineId);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      updateLine(lineId, { customImageData: dataUrl });
    } catch {
      setImageUploadError("No se pudo cargar la imagen. Prueba con otro archivo.");
    } finally {
      setLineImageLoadingId(null);
    }
  }

  async function handleManualImageUpload(file: File) {
    setImageUploadError(null);
    setManualImageLoading(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setManualLine((prev) => ({ ...prev, customImageData: dataUrl }));
    } catch {
      setImageUploadError("No se pudo cargar la imagen. Prueba con otro archivo.");
    } finally {
      setManualImageLoading(false);
    }
  }

  function addManualLine() {
    if (!manualLine.seriesName.trim()) return;
    const squareMeters = parseDecimalInput(manualSquareMeters);
    const pricePerM2 = parseDecimalInput(manualPricePerM2);
    onLinesChange([
      ...lines,
      { ...manualLine, id: crypto.randomUUID(), squareMeters, pricePerM2 },
    ]);
    setManualLine(newManualLine());
    setManualSquareMeters("");
    setManualPricePerM2("");
    setShowManualForm(false);
    setImageUploadError(null);
    if (manualFileInputRef.current) manualFileInputRef.current.value = "";
  }

  const grandTotal = lines.reduce((sum, line) => sum + (lineTotal(line) ?? 0), 0);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-200 px-4 py-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0 flex-1">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Nombre de la oferta
            </label>
            <input
              value={offerName}
              onChange={(e) => onOfferNameChange(e.target.value)}
              placeholder='Ej. "Rústicos segunda calidad para Barcelona"'
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-[var(--practika-primary)]"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowManualForm((v) => !v)}
              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-50"
            >
              + Línea manual
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={saving || !offerName.trim()}
              className="rounded-lg bg-[var(--practika-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--practika-primary-light)] disabled:opacity-60"
            >
              {saving ? "Guardando..." : offerId ? "Actualizar oferta" : "Guardar oferta"}
            </button>
            {offerId ? (
              <>
                <BulkOfferLineSortSelect value={lineSort} onChange={setLineSort} compact />
                <button
                  type="button"
                  onClick={() => onExportExcel(lineSort)}
                  className="rounded-lg border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-50"
                >
                  Excel
                </button>
                <BulkOfferPdfMenu offerId={offerId} sort={lineSort} />
              </>
            ) : null}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-neutral-500">
            {lines.length} líneas · Total estimado:{" "}
            <strong>{grandTotal.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</strong>
            {canReorder && lines.length > 1 ? (
              <span className="ml-2 text-neutral-400">· Arrastra ⋮⋮ para reordenar</span>
            ) : null}
          </p>
          {lines.length > 0 && !offerId ? (
            <BulkOfferLineSortSelect value={lineSort} onChange={setLineSort} />
          ) : null}
        </div>
      </div>

      {showManualForm ? (
        <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <input
              value={manualLine.seriesName}
              onChange={(e) => setManualLine({ ...manualLine, seriesName: e.target.value })}
              placeholder="Serie *"
              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
            />
            <input
              value={manualLine.material}
              onChange={(e) => setManualLine({ ...manualLine, material: e.target.value })}
              placeholder="Material"
              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
            />
            <input
              value={manualLine.formatLabel}
              onChange={(e) =>
                setManualLine({
                  ...manualLine,
                  formatLabel: e.target.value,
                  formatDisplay: e.target.value ? `${e.target.value.replace("x", " × ")} cm` : "",
                })
              }
              placeholder="Formato (ej. 60x120)"
              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
            />
            <input
              value={manualLine.colorName}
              onChange={(e) => setManualLine({ ...manualLine, colorName: e.target.value })}
              placeholder="Color"
              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
            />
            <input
              value={manualSquareMeters}
              onChange={(e) => {
                const next = e.target.value;
                if (!isDecimalDraft(next)) return;
                setManualSquareMeters(next);
              }}
              inputMode="decimal"
              placeholder="m²"
              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
            />
            <input
              value={manualPricePerM2}
              onChange={(e) => {
                const next = e.target.value;
                if (!isDecimalDraft(next)) return;
                setManualPricePerM2(next);
              }}
              inputMode="decimal"
              placeholder="€/m²"
              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
            />
            <input
              value={manualLine.comments}
              onChange={(e) => setManualLine({ ...manualLine, comments: e.target.value })}
              placeholder="Comentarios"
              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm md:col-span-2"
            />
          </div>
          <div className="mt-3 flex flex-wrap items-start gap-4">
            <div className="flex items-start gap-3">
              {manualLine.customImageData ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={manualLine.customImageData}
                  alt=""
                  className="h-20 w-20 rounded-lg border border-neutral-200 object-cover"
                />
              ) : manualImageLoading ? (
                <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-white text-xs text-neutral-500">
                  Cargando…
                </div>
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-neutral-300 text-xs text-neutral-400">
                  Sin foto
                </div>
              )}
              <div className="space-y-2">
                <label
                  className={`inline-flex cursor-pointer rounded-lg border border-neutral-200 px-3 py-2 text-sm hover:bg-white ${
                    manualImageLoading ? "pointer-events-none opacity-60" : ""
                  }`}
                >
                  {manualImageLoading ? "Cargando imagen…" : manualLine.customImageData ? "Cambiar imagen" : "Subir imagen"}
                  <input
                    ref={manualFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={manualImageLoading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      await handleManualImageUpload(file);
                      e.target.value = "";
                    }}
                  />
                </label>
                {manualLine.customImageData ? (
                  <button
                    type="button"
                    onClick={() => {
                      setManualLine((prev) => ({ ...prev, customImageData: "" }));
                      if (manualFileInputRef.current) manualFileInputRef.current.value = "";
                    }}
                    className="block text-xs text-neutral-500 hover:underline"
                  >
                    Quitar imagen
                  </button>
                ) : null}
              </div>
            </div>
            <button
              type="button"
              onClick={addManualLine}
              className="rounded-lg bg-[var(--practika-primary)] px-4 py-2 text-sm font-semibold text-white"
            >
              Añadir línea manual
            </button>
          </div>
          {imageUploadError && showManualForm ? (
            <p className="mt-2 text-sm text-red-600">{imageUploadError}</p>
          ) : null}
        </div>
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file || !uploadTargetId) return;
          await handleImageUpload(file, uploadTargetId);
          setUploadTargetId(null);
          e.target.value = "";
        }}
      />

      {lines.length === 0 ? (
        <div className="px-4 py-12 text-center text-sm text-neutral-500">
          Añade líneas desde el listado de productos o crea una línea manual.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={lineIds} strategy={verticalListSortingStrategy} disabled={!canReorder}>
            <div className="divide-y divide-neutral-100">
              {displayedLines.map((line) => (
                <SortableOfferLine
                  key={line.id}
                  line={line}
                  canReorder={canReorder}
                  isUploading={lineImageLoadingId === line.id}
                  onUpdate={(patch) => updateLine(line.id, patch)}
                  onRemove={() => removeLine(line.id)}
                  onPickImage={() => {
                    setUploadTargetId(line.id);
                    fileInputRef.current?.click();
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      {imageUploadError && !showManualForm ? (
        <p className="border-t border-neutral-100 px-4 py-3 text-sm text-red-600">{imageUploadError}</p>
      ) : null}
    </div>
  );
}

function SortableOfferLine({
  line,
  canReorder,
  isUploading,
  onUpdate,
  onRemove,
  onPickImage,
}: {
  line: BulkOfferLineDraft;
  canReorder: boolean;
  isUploading: boolean;
  onUpdate: (patch: Partial<BulkOfferLineDraft>) => void;
  onRemove: () => void;
  onPickImage: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: line.id,
    disabled: !canReorder,
  });
  const image = resolveLineImage(line);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : undefined,
    position: isDragging ? ("relative" as const) : undefined,
    boxShadow: isDragging ? "0 12px 28px rgba(15, 23, 42, 0.12)" : undefined,
    backgroundColor: isDragging ? "#fff" : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`grid gap-4 px-4 py-4 lg:grid-cols-[28px_88px_minmax(0,1fr)_auto] lg:items-start ${
        isDragging ? "opacity-95" : ""
      }`}
    >
      <div className="flex items-start justify-center pt-1">
        {canReorder ? (
          <button
            type="button"
            className="cursor-grab touch-none rounded px-1 py-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 active:cursor-grabbing"
            aria-label="Arrastrar línea"
            title="Arrastrar para reordenar"
            {...attributes}
            {...listeners}
          >
            ⋮⋮
          </button>
        ) : (
          <span className="w-5" aria-hidden />
        )}
      </div>

      <div>
        {isUploading ? (
          <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 text-xs text-neutral-500">
            Cargando…
          </div>
        ) : image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-20 w-20 rounded-lg border border-neutral-200 object-cover" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-neutral-300 text-xs text-neutral-400">
            Sin foto
          </div>
        )}
        <button
          type="button"
          disabled={isUploading}
          onClick={onPickImage}
          className="mt-2 text-xs text-[var(--practika-primary)] hover:underline disabled:opacity-60"
        >
          {isUploading ? "Cargando imagen…" : image ? "Cambiar imagen" : "Subir imagen"}
        </button>
        {line.customImageData ? (
          <button
            type="button"
            onClick={() => onUpdate({ customImageData: "" })}
            className="mt-1 block text-xs text-neutral-500 hover:underline"
          >
            Restaurar CRM
          </button>
        ) : null}
      </div>

      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        <Field label="Serie" value={line.seriesName} onChange={(v) => onUpdate({ seriesName: v })} />
        <Field label="Material" value={line.material} onChange={(v) => onUpdate({ material: v })} />
        <Field
          label="Formato"
          value={line.formatLabel}
          onChange={(v) =>
            onUpdate({
              formatLabel: v,
              formatDisplay: v ? `${v.replace("x", " × ")} cm` : "",
            })
          }
        />
        <Field label="Color" value={line.colorName} onChange={(v) => onUpdate({ colorName: v })} />
        <DecimalField
          label="m²"
          value={line.squareMeters}
          onChange={(v) => onUpdate({ squareMeters: v })}
        />
        <DecimalField
          label="€/m²"
          value={line.pricePerM2}
          onChange={(v) => onUpdate({ pricePerM2: v })}
        />
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-neutral-500">Comentarios</label>
          <input
            value={line.comments}
            onChange={(e) => onUpdate({ comments: e.target.value })}
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex items-end text-sm text-neutral-600">
          Total:{" "}
          <strong className="ml-1">
            {(lineTotal(line) ?? 0).toLocaleString("es-ES", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            €
          </strong>
          {line.isManual ? (
            <span className="ml-2 rounded bg-neutral-100 px-2 py-0.5 text-[10px] uppercase">Manual</span>
          ) : null}
        </div>
      </div>

      <div className="flex gap-2 lg:flex-col">
        <button
          type="button"
          onClick={onRemove}
          className="rounded border border-red-200 px-2 py-1 text-xs text-red-600"
        >
          Quitar
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-neutral-500">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
      />
    </div>
  );
}

function DecimalField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  const [draft, setDraft] = useState(() => formatDecimalInput(value));
  const focusedRef = useRef(false);

  useEffect(() => {
    if (!focusedRef.current) {
      setDraft(formatDecimalInput(value));
    }
  }, [value]);

  function commitDraft(next: string) {
    setDraft(next);
    if (next === "" || next === "." || next === "," || next === "-") {
      onChange(null);
      return;
    }
    if (/[.,]$/.test(next)) return;
    onChange(parseDecimalInput(next));
  }

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-neutral-500">{label}</label>
      <input
        value={draft}
        inputMode="decimal"
        onFocus={() => {
          focusedRef.current = true;
        }}
        onBlur={() => {
          focusedRef.current = false;
          const parsed = parseDecimalInput(draft);
          setDraft(formatDecimalInput(parsed));
          onChange(parsed);
        }}
        onChange={(e) => {
          const next = e.target.value;
          if (!isDecimalDraft(next)) return;
          commitDraft(next);
        }}
        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
      />
    </div>
  );
}
