"use client";

import { useEffect, useRef, useState } from "react";
import { bulkOfferExportUrl, type BulkOfferLineSortMode } from "@/lib/bulk-offer-line-sort";

type Props = {
  offerId: string;
  sort: BulkOfferLineSortMode;
  buttonClassName?: string;
};

export function BulkOfferPdfMenu({ offerId, sort, buttonClassName }: Props) {
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

  function viewPdf() {
    window.open(
      bulkOfferExportUrl(offerId, "pdf", { sort, disposition: "inline" }),
      "_blank",
      "noopener,noreferrer",
    );
    setOpen(false);
  }

  function downloadPdf() {
    window.location.href = bulkOfferExportUrl(offerId, "pdf", { sort, disposition: "attachment" });
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={
          buttonClassName ??
          "rounded-lg border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-50"
        }
      >
        PDF ▾
      </button>
      {open ? (
        <div className="absolute right-0 z-20 mt-1 min-w-[9.5rem] overflow-hidden rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={viewPdf}
            className="block w-full px-3 py-2 text-left text-sm hover:bg-neutral-50"
          >
            Ver
          </button>
          <button
            type="button"
            onClick={downloadPdf}
            className="block w-full px-3 py-2 text-left text-sm hover:bg-neutral-50"
          >
            Descargar
          </button>
        </div>
      ) : null}
    </div>
  );
}
