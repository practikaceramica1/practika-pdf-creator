"use client";

import { FlexibleCatalogDocument } from "@/components/catalog/FlexibleCatalogDocument";
import { sampleCatalogDocument } from "@/data/catalog-sample";
import type { CatalogDocument } from "@/lib/catalog-builder-types";
import { STORAGE_KEY } from "@/lib/catalog-builder-types";
import { useEffect, useState } from "react";

export default function PrintCatalogoPage() {
  const [doc, setDoc] = useState<CatalogDocument | null>(null);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? sessionStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as CatalogDocument;
        if (parsed?.pages?.length) {
          setDoc(parsed);
          return;
        }
      } catch {
        /* fall through */
      }
    }
    setDoc(sampleCatalogDocument);
  }, []);

  if (!doc) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm text-neutral-500">
        Cargando catálogo…
      </div>
    );
  }

  return <FlexibleCatalogDocument catalog={doc} />;
}
