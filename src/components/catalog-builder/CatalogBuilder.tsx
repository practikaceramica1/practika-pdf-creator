"use client";
/* eslint-disable @next/next/no-img-element */

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
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { FlexibleCatalogDocument } from "@/components/catalog/FlexibleCatalogDocument";
import {
  CATALOG_THEMES,
  STORAGE_KEY,
  type CatalogDocument,
  type CatalogPage,
  type CatalogPageType,
  type CatalogProduct,
  type CatalogThemeId,
  type ContentBlock,
  createEmptyCatalog,
  createPage,
  emptyProduct,
  newId,
} from "@/lib/catalog-builder-types";

const PAGE_TYPES: { type: CatalogPageType; label: string }[] = [
  { type: "cover", label: "Portada" },
  { type: "section", label: "Sección (texto)" },
  { type: "legend", label: "Simbología / imagen" },
  { type: "grid", label: "Rejilla productos" },
  { type: "blocks", label: "Página flexible (bloques)" },
];

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function SortablePageRow({
  id,
  label,
  active,
  onSelect,
  onDelete,
}: {
  id: string;
  label: string;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.65 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded border px-2 py-2 text-sm ${
        active ? "border-[#5c5346] bg-[#f5f3ee]" : "border-neutral-200 bg-white"
      }`}
    >
      <button
        type="button"
        className="cursor-grab touch-none rounded px-1 text-neutral-400 hover:text-neutral-700 active:cursor-grabbing"
        aria-label="Arrastrar página"
        {...attributes}
        {...listeners}
      >
        ⋮⋮
      </button>
      <button type="button" className="min-w-0 flex-1 truncate text-left font-medium" onClick={onSelect}>
        {label}
      </button>
      <button
        type="button"
        className="shrink-0 rounded px-2 py-0.5 text-xs text-red-600 hover:bg-red-50"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        ✕
      </button>
    </div>
  );
}

function SortableProductRow({
  product,
  onChange,
  onRemove,
  onImage,
}: {
  product: CatalogProduct;
  onChange: (p: CatalogProduct) => void;
  onRemove: () => void;
  onImage: (file: File) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: product.id,
  });
  const inputRef = useRef<HTMLInputElement | null>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.65 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col gap-2 rounded border border-neutral-200 bg-neutral-50/80 p-3 sm:flex-row sm:items-start"
    >
      <button
        type="button"
        className="cursor-grab shrink-0 rounded px-1 text-neutral-400 hover:text-neutral-700 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        ⋮⋮
      </button>
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded border border-neutral-200 bg-white">
        {product.imageSrc ? (
          <button type="button" className="h-full w-full" onClick={() => inputRef.current?.click()}>
            <img src={product.imageSrc} alt="" className="h-full w-full object-cover" />
          </button>
        ) : (
          <button
            type="button"
            className="flex h-full w-full items-center justify-center text-[10px] text-neutral-400"
            onClick={() => inputRef.current?.click()}
          >
            Imagen
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onImage(f);
          }}
        />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <input
          className="w-full rounded border border-neutral-200 px-2 py-1 text-sm font-medium"
          value={product.name}
          onChange={(e) => onChange({ ...product, name: e.target.value })}
        />
        <div className="flex flex-wrap gap-2">
          <input
            className="min-w-[120px] flex-1 rounded border border-neutral-200 px-2 py-1 text-xs"
            placeholder="Material"
            value={product.material ?? ""}
            onChange={(e) => onChange({ ...product, material: e.target.value })}
          />
          <input
            className="min-w-[100px] flex-1 rounded border border-neutral-200 px-2 py-1 text-xs"
            placeholder="Formato"
            value={product.format ?? ""}
            onChange={(e) => onChange({ ...product, format: e.target.value })}
          />
        </div>
        <input
          className="w-full rounded border border-neutral-200 px-2 py-1 text-xs"
          placeholder="Notas (opcional)"
          value={product.notes ?? ""}
          onChange={(e) => onChange({ ...product, notes: e.target.value })}
        />
      </div>
      <button type="button" className="shrink-0 self-start text-xs text-red-600 hover:underline" onClick={onRemove}>
        Quitar
      </button>
    </div>
  );
}

function SortableBlockRow({
  block,
  onChange,
  onRemove,
  onImage,
}: {
  block: ContentBlock;
  onChange: (b: ContentBlock) => void;
  onRemove: () => void;
  onImage: (file: File) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const inputRef = useRef<HTMLInputElement | null>(null);
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.65 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="rounded border border-neutral-200 bg-white p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <button
          type="button"
          className="cursor-grab rounded px-1 text-neutral-400 hover:text-neutral-700 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          ⋮⋮
        </button>
        <select
          className="rounded border border-neutral-200 px-2 py-1 text-xs"
          value={block.kind}
          onChange={(e) => {
            const k = e.target.value as ContentBlock["kind"];
            if (k === "heading") onChange({ id: block.id, kind: "heading", text: "Título" });
            else if (k === "paragraph") onChange({ id: block.id, kind: "paragraph", text: "" });
            else onChange({ id: block.id, kind: "image", src: "/catalog/placeholder-tile.svg", caption: "" });
          }}
        >
          <option value="heading">Título</option>
          <option value="paragraph">Párrafo</option>
          <option value="image">Imagen</option>
        </select>
        <button type="button" className="text-xs text-red-600 hover:underline" onClick={onRemove}>
          Quitar
        </button>
      </div>
      {block.kind === "heading" ? (
        <input
          className="w-full rounded border border-neutral-200 px-2 py-2 text-sm font-semibold"
          value={block.text}
          onChange={(e) => onChange({ ...block, text: e.target.value })}
        />
      ) : null}
      {block.kind === "paragraph" ? (
        <textarea
          className="w-full rounded border border-neutral-200 px-2 py-2 text-sm"
          rows={4}
          value={block.text}
          onChange={(e) => onChange({ ...block, text: e.target.value })}
        />
      ) : null}
      {block.kind === "image" ? (
        <div className="space-y-2">
          <div className="flex h-32 items-center justify-center overflow-hidden rounded border bg-neutral-50">
            {block.src ? (
              <button type="button" className="h-full w-full" onClick={() => inputRef.current?.click()}>
                <img src={block.src} alt="" className="h-full w-full object-contain" />
              </button>
            ) : (
              <button type="button" className="text-xs text-neutral-500" onClick={() => inputRef.current?.click()}>
                Subir imagen
              </button>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) onImage(f);
              }}
            />
          </div>
          <input
            className="w-full rounded border border-neutral-200 px-2 py-1 text-xs"
            placeholder="Pie de foto (opcional)"
            value={block.caption ?? ""}
            onChange={(e) => onChange({ ...block, caption: e.target.value })}
          />
        </div>
      ) : null}
    </div>
  );
}

function pageLabel(page: CatalogPage, index: number): string {
  const n = index + 1;
  switch (page.type) {
    case "cover":
      return `${n}. Portada — ${page.title}`;
    case "section":
      return `${n}. Sección — ${page.heading}`;
    case "legend":
      return `${n}. Simbología`;
    case "grid":
      return `${n}. Rejilla (${page.products.length} prod.)`;
    case "blocks":
      return `${n}. Bloques (${page.blocks.length})`;
    default:
      return `${n}. Página`;
  }
}

function updatePageInDoc(doc: CatalogDocument, pageId: string, next: CatalogPage): CatalogDocument {
  return {
    ...doc,
    pages: doc.pages.map((p) => (p.id === pageId ? next : p)),
  };
}

function loadCatalogFromSession(): CatalogDocument | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CatalogDocument;
    if (parsed?.pages?.length) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

export function CatalogBuilder() {
  const [doc, setDoc] = useState<CatalogDocument>(() => createEmptyCatalog());

  useEffect(() => {
    const loaded = loadCatalogFromSession();
    if (loaded) setDoc(loaded);
  }, []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const printMountRef = useRef<HTMLDivElement | null>(null);
  const importRef = useRef<HTMLInputElement | null>(null);

  const selectedPage = doc.pages.find((p) => p.id === selectedId) ?? doc.pages[0] ?? null;

  useEffect(() => {
    if (!doc.pages.length) return;
    if (selectedId === null || !doc.pages.some((p) => p.id === selectedId)) {
      setSelectedId(doc.pages[0].id);
    }
  }, [doc.pages, selectedId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const productSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const blockSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const pageIds = useMemo(() => doc.pages.map((p) => p.id), [doc.pages]);

  const onPageDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = pageIds.indexOf(String(active.id));
      const newIndex = pageIds.indexOf(String(over.id));
      if (oldIndex < 0 || newIndex < 0) return;
      setDoc((d) => ({
        ...d,
        pages: arrayMove(d.pages, oldIndex, newIndex),
      }));
    },
    [pageIds],
  );

  const persistSession = useCallback((next: CatalogDocument) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const setDocAndPersist = useCallback(
    (updater: CatalogDocument | ((prev: CatalogDocument) => CatalogDocument)) => {
      setDoc((prev) => {
        const next = typeof updater === "function" ? (updater as (p: CatalogDocument) => CatalogDocument)(prev) : updater;
        persistSession(next);
        return next;
      });
    },
    [persistSession],
  );

  const addPage = (type: CatalogPageType) => {
    const page = createPage(type);
    setDocAndPersist((d) => ({ ...d, pages: [...d.pages, page] }));
    setSelectedId(page.id);
  };

  const removePage = (id: string) => {
    setDocAndPersist((d) => {
      const pages = d.pages.filter((p) => p.id !== id);
      return { ...d, pages: pages.length ? pages : [createPage("cover")] };
    });
    setSelectedId((cur) => (cur === id ? null : cur));
  };

  const setTheme = (theme: CatalogThemeId) => setDocAndPersist((d) => ({ ...d, theme }));

  async function downloadFullPdf() {
    const root = printMountRef.current;
    if (!root) return;
    const nodes = root.querySelectorAll<HTMLElement>(".print-page");
    if (!nodes.length) return;

    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const w = 595.28;
    const h = 841.89;

    for (let i = 0; i < nodes.length; i += 1) {
      const dataUrl = await toPng(nodes[i], { pixelRatio: 2, cacheBust: true });
      if (i > 0) pdf.addPage("a4", "portrait");
      pdf.addImage(dataUrl, "PNG", 0, 0, w, h);
    }
    const safeName = doc.name.replace(/[^\w\d\-_.\s]/g, "_").slice(0, 80) || "catalogo";
    pdf.save(`practika-${safeName}.pdf`);
  }

  function downloadJson() {
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${doc.name.replace(/[^\w\d\-_.\s]/g, "_").slice(0, 60) || "catalogo"}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function importJsonFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as CatalogDocument;
        if (!parsed.pages || !Array.isArray(parsed.pages)) throw new Error("JSON inválido");
        setDocAndPersist(parsed);
        setSelectedId(parsed.pages[0]?.id ?? null);
      } catch {
        alert("No se pudo importar el JSON.");
      }
    };
    reader.readAsText(file);
  }

  function openPrintTab() {
    persistSession(doc);
    window.open("/print/catalogo", "_blank", "noopener,noreferrer");
  }

  /* ——— Editor panel for selected page ——— */
  let editor: ReactNode = null;
  if (selectedPage) {
    const pid = selectedPage.id;
    if (selectedPage.type === "cover") {
      editor = (
        <div className="space-y-3">
          <input
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            value={selectedPage.title}
            onChange={(e) =>
              setDocAndPersist(updatePageInDoc(doc, pid, { ...selectedPage, title: e.target.value }))
            }
            placeholder="Título portada"
          />
          <input
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            value={selectedPage.subtitle ?? ""}
            onChange={(e) =>
              setDocAndPersist(updatePageInDoc(doc, pid, { ...selectedPage, subtitle: e.target.value }))
            }
            placeholder="Subtítulo"
          />
          <input
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            value={selectedPage.season ?? ""}
            onChange={(e) =>
              setDocAndPersist(updatePageInDoc(doc, pid, { ...selectedPage, season: e.target.value }))
            }
            placeholder="Temporada / año"
          />
          <label className="block text-xs font-medium text-neutral-600">Imagen principal</label>
          <input
            type="file"
            accept="image/*"
            className="text-sm"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f)
                setDocAndPersist(
                  updatePageInDoc(doc, pid, {
                    ...selectedPage,
                    heroSrc: await fileToDataUrl(f),
                  }),
                );
            }}
          />
        </div>
      );
    } else if (selectedPage.type === "section") {
      editor = (
        <div className="space-y-3">
          <input
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm font-medium"
            value={selectedPage.heading}
            onChange={(e) =>
              setDocAndPersist(updatePageInDoc(doc, pid, { ...selectedPage, heading: e.target.value }))
            }
            placeholder="Encabezado"
          />
          <textarea
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            rows={6}
            value={selectedPage.body ?? ""}
            onChange={(e) =>
              setDocAndPersist(updatePageInDoc(doc, pid, { ...selectedPage, body: e.target.value }))
            }
            placeholder="Texto"
          />
        </div>
      );
    } else if (selectedPage.type === "legend") {
      editor = (
        <div className="space-y-3">
          <label className="block text-xs font-medium text-neutral-600">Imagen a página completa</label>
          <input
            type="file"
            accept="image/*"
            className="text-sm"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f)
                setDocAndPersist(
                  updatePageInDoc(doc, pid, {
                    ...selectedPage,
                    imageSrc: await fileToDataUrl(f),
                  }),
                );
            }}
          />
          <input
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            value={selectedPage.imageAlt ?? ""}
            onChange={(e) =>
              setDocAndPersist(updatePageInDoc(doc, pid, { ...selectedPage, imageAlt: e.target.value }))
            }
            placeholder="Texto alternativo"
          />
        </div>
      );
    } else if (selectedPage.type === "grid") {
      const productIds = selectedPage.products.map((p) => p.id);
      const onProductDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = productIds.indexOf(String(active.id));
        const newIndex = productIds.indexOf(String(over.id));
        if (oldIndex < 0 || newIndex < 0) return;
        setDocAndPersist(
          updatePageInDoc(doc, pid, {
            ...selectedPage,
            products: arrayMove(selectedPage.products, oldIndex, newIndex),
          }),
        );
      };

      editor = (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-neutral-600">Columnas</label>
            <select
              className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm"
              value={selectedPage.columns}
              onChange={(e) =>
                setDocAndPersist(
                  updatePageInDoc(doc, pid, {
                    ...selectedPage,
                    columns: Number(e.target.value) as 2 | 3 | 4,
                  }),
                )
              }
            >
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </div>
          <DndContext sensors={productSensors} collisionDetection={closestCenter} onDragEnd={onProductDragEnd}>
            <SortableContext items={productIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {selectedPage.products.map((prod) => (
                  <SortableProductRow
                    key={prod.id}
                    product={prod}
                    onChange={(p) => {
                      setDocAndPersist(
                        updatePageInDoc(doc, pid, {
                          ...selectedPage,
                          products: selectedPage.products.map((x) => (x.id === p.id ? p : x)),
                        }),
                      );
                    }}
                    onRemove={() => {
                      setDocAndPersist(
                        updatePageInDoc(doc, pid, {
                          ...selectedPage,
                          products: selectedPage.products.filter((x) => x.id !== prod.id),
                        }),
                      );
                    }}
                    onImage={async (file) => {
                      const src = await fileToDataUrl(file);
                      setDocAndPersist(
                        updatePageInDoc(doc, pid, {
                          ...selectedPage,
                          products: selectedPage.products.map((x) =>
                            x.id === prod.id ? { ...x, imageSrc: src } : x,
                          ),
                        }),
                      );
                    }}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <button
            type="button"
            className="w-full rounded border border-dashed border-neutral-300 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
            onClick={() =>
              setDocAndPersist(
                updatePageInDoc(doc, pid, {
                  ...selectedPage,
                  products: [...selectedPage.products, emptyProduct()],
                }),
              )
            }
          >
            + Añadir producto
          </button>
        </div>
      );
    } else if (selectedPage.type === "blocks") {
      const blockIds = selectedPage.blocks.map((b) => b.id);
      const onBlockDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = blockIds.indexOf(String(active.id));
        const newIndex = blockIds.indexOf(String(over.id));
        if (oldIndex < 0 || newIndex < 0) return;
        setDocAndPersist(
          updatePageInDoc(doc, pid, {
            ...selectedPage,
            blocks: arrayMove(selectedPage.blocks, oldIndex, newIndex),
          }),
        );
      };

      editor = (
        <div className="space-y-3">
          <DndContext sensors={blockSensors} collisionDetection={closestCenter} onDragEnd={onBlockDragEnd}>
            <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {selectedPage.blocks.map((block) => (
                  <SortableBlockRow
                    key={block.id}
                    block={block}
                    onChange={(b) =>
                      setDocAndPersist(
                        updatePageInDoc(doc, pid, {
                          ...selectedPage,
                          blocks: selectedPage.blocks.map((x) => (x.id === b.id ? b : x)),
                        }),
                      )
                    }
                    onRemove={() =>
                      setDocAndPersist(
                        updatePageInDoc(doc, pid, {
                          ...selectedPage,
                          blocks: selectedPage.blocks.filter((x) => x.id !== block.id),
                        }),
                      )
                    }
                    onImage={async (file) => {
                      const src = await fileToDataUrl(file);
                      if (block.kind === "image")
                        setDocAndPersist(
                          updatePageInDoc(doc, pid, {
                            ...selectedPage,
                            blocks: selectedPage.blocks.map((x) =>
                              x.id === block.id && x.kind === "image" ? { ...x, src } : x,
                            ),
                          }),
                        );
                    }}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <button
            type="button"
            className="w-full rounded border border-dashed border-neutral-300 py-2 text-sm"
            onClick={() =>
              setDocAndPersist(
                updatePageInDoc(doc, pid, {
                  ...selectedPage,
                  blocks: [...selectedPage.blocks, { id: newId(), kind: "paragraph", text: "" }],
                }),
              )
            }
          >
            + Añadir bloque
          </button>
        </div>
      );
    }
  }

  return (
    <div className="mx-auto flex min-h-0 max-w-[1600px] flex-col gap-4 px-4 py-6 lg:flex-row lg:items-start">
      {/* Hidden full document for PDF rasterization */}
      <div
        ref={printMountRef}
        className="pointer-events-none fixed left-[-9999px] top-0 z-[-1] w-[210mm]"
        aria-hidden
      >
        <FlexibleCatalogDocument catalog={doc} />
      </div>

      <aside className="w-full shrink-0 space-y-3 lg:w-[280px]">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Páginas</h2>
        <p className="text-xs text-neutral-500">Arrastra para reordenar.</p>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onPageDragEnd}>
          <SortableContext items={pageIds} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {doc.pages.map((p, i) => (
                <SortablePageRow
                  key={p.id}
                  id={p.id}
                  label={pageLabel(p, i)}
                  active={selectedId === p.id || (!selectedId && i === 0)}
                  onSelect={() => setSelectedId(p.id)}
                  onDelete={() => removePage(p.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <div className="border-t border-neutral-200 pt-3">
          <p className="mb-2 text-xs font-medium text-neutral-600">Añadir página</p>
          <div className="flex flex-col gap-1">
            {PAGE_TYPES.map((pt) => (
              <button
                key={pt.type}
                type="button"
                className="rounded border border-neutral-200 bg-white px-3 py-2 text-left text-sm hover:bg-neutral-50"
                onClick={() => addPage(pt.type)}
              >
                + {pt.label}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <input
            className="min-w-[180px] rounded border border-neutral-300 bg-white px-3 py-2 text-sm"
            value={doc.name}
            onChange={(e) => setDocAndPersist({ ...doc, name: e.target.value })}
            placeholder="Nombre del proyecto / archivo"
          />
          <label className="flex items-center gap-2 text-sm">
            <span className="text-neutral-600">Tema</span>
            <select
              className="rounded border border-neutral-300 bg-white px-3 py-2 text-sm"
              value={doc.theme}
              onChange={(e) => setTheme(e.target.value as CatalogThemeId)}
            >
              {CATALOG_THEMES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="rounded bg-[#2d2d2d] px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
            onClick={downloadFullPdf}
          >
            Descargar PDF (catálogo)
          </button>
          <button
            type="button"
            className="rounded border border-neutral-300 bg-white px-4 py-2 text-sm hover:bg-neutral-50"
            onClick={downloadJson}
          >
            Exportar JSON
          </button>
          <button
            type="button"
            className="rounded border border-neutral-300 bg-white px-4 py-2 text-sm hover:bg-neutral-50"
            onClick={() => importRef.current?.click()}
          >
            Importar JSON
          </button>
          <input
            ref={importRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importJsonFile(f);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            className="rounded border border-neutral-300 bg-white px-4 py-2 text-sm hover:bg-neutral-50"
            onClick={openPrintTab}
          >
            Vista impresión / imprimir
          </button>
        </div>
        <p className="text-xs text-neutral-500">
          {CATALOG_THEMES.find((x) => x.id === doc.theme)?.hint}
        </p>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="overflow-auto rounded-lg border border-neutral-200 bg-neutral-100/80 p-4">
            <p className="mb-2 text-xs font-medium text-neutral-500">Vista previa (todas las páginas)</p>
            <div className="mx-auto flex max-h-[70vh] flex-col gap-6 overflow-y-auto">
              <FlexibleCatalogDocument catalog={doc} />
            </div>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-900">Editar página seleccionada</h3>
            <p className="mt-1 text-xs text-neutral-500">
              {selectedPage ? pageLabel(selectedPage, doc.pages.indexOf(selectedPage)) : "Selecciona una página"}
            </p>
            <div className="mt-4">{editor}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
