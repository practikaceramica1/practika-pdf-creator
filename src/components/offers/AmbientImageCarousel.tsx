"use client";
/* eslint-disable @next/next/no-img-element */

type Props = {
  images: string[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
};

export function AmbientImageCarousel({ images, selectedIndex, onSelectIndex }: Props) {
  if (images.length === 0) return null;

  const safeIndex = Math.min(Math.max(selectedIndex, 0), images.length - 1);
  const current = images[safeIndex];

  function goPrev() {
    onSelectIndex(safeIndex === 0 ? images.length - 1 : safeIndex - 1);
  }

  function goNext() {
    onSelectIndex(safeIndex === images.length - 1 ? 0 : safeIndex + 1);
  }

  return (
    <div className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">Imágenes de ambiente</h3>
          <p className="mt-1 text-xs text-neutral-500">
            La imagen visible se usará como ambiente en la oferta. Puedes sustituirla más abajo con una propia.
          </p>
        </div>
        {images.length > 1 ? (
          <span className="shrink-0 text-xs text-neutral-500">
            {safeIndex + 1} / {images.length}
          </span>
        ) : null}
      </div>

      <div className="relative overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
        <img src={current} alt="" className="mx-auto max-h-56 w-full object-cover" />

        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-sm font-medium text-neutral-800 shadow hover:bg-white"
              aria-label="Imagen anterior"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-sm font-medium text-neutral-800 shadow hover:bg-white"
              aria-label="Imagen siguiente"
            >
              ›
            </button>
          </>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="flex flex-wrap justify-center gap-2">
          {images.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              onClick={() => onSelectIndex(index)}
              className={`overflow-hidden rounded border-2 transition ${
                index === safeIndex ? "border-[var(--practika-primary)]" : "border-transparent opacity-70 hover:opacity-100"
              }`}
              aria-label={`Seleccionar ambiente ${index + 1}`}
            >
              <img src={src} alt="" className="h-14 w-20 object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
