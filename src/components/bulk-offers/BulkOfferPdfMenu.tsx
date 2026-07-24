"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { bulkOfferExportUrl, type BulkOfferLineSortMode } from "@/lib/bulk-offer-line-sort";

type Props = {
  offerId: string;
  sort: BulkOfferLineSortMode;
  buttonClassName?: string;
};

type MenuPosition = {
  top: number;
  left: number;
};

export function BulkOfferPdfMenu({ offerId, sort, buttonClassName }: Props) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }

    function updatePosition() {
      const button = buttonRef.current;
      const menu = menuRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const menuWidth = menu?.offsetWidth ?? 152;
      const menuHeight = menu?.offsetHeight ?? 80;
      const gap = 4;
      const padding = 8;

      let top = rect.bottom + gap;
      if (top + menuHeight > window.innerHeight - padding) {
        top = Math.max(padding, rect.top - menuHeight - gap);
      }

      let left = rect.right - menuWidth;
      left = Math.min(left, window.innerWidth - menuWidth - padding);
      left = Math.max(padding, left);

      setPosition({ top, left });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
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
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={
          buttonClassName ??
          "rounded-lg border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-50"
        }
      >
        PDF ▾
      </button>
      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              style={
                position
                  ? { top: position.top, left: position.left }
                  : { top: 0, left: 0, visibility: "hidden" }
              }
              className="fixed z-50 min-w-[9.5rem] overflow-hidden rounded-lg border border-neutral-200 bg-white py-1 shadow-lg"
            >
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
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
