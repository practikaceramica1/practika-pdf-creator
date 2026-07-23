import type { BulkOfferDetail, BulkOfferLineDraft } from "@/lib/bulk-offers-types";

export type BulkOfferLineSortMode =
  | "series"
  | "squareMeters"
  | "pricePerM2"
  | "format"
  | "material"
  | "creation";

export const BULK_OFFER_LINE_SORT_OPTIONS: { value: BulkOfferLineSortMode; label: string }[] = [
  { value: "series", label: "Serie (A-Z)" },
  { value: "squareMeters", label: "m²" },
  { value: "pricePerM2", label: "€/m²" },
  { value: "format", label: "Formato" },
  { value: "material", label: "Material" },
  { value: "creation", label: "Orden de creación" },
];

export function parseBulkOfferLineSortMode(raw: string | null | undefined): BulkOfferLineSortMode {
  switch (raw) {
    case "squareMeters":
    case "pricePerM2":
    case "format":
    case "material":
    case "creation":
      return raw;
    default:
      return "series";
  }
}

export function sortBulkOfferLines(
  lines: BulkOfferLineDraft[],
  mode: BulkOfferLineSortMode,
): BulkOfferLineDraft[] {
  if (mode === "creation") return lines;

  const indexed = lines.map((line, index) => ({ line, index }));

  indexed.sort((a, b) => {
    let result = 0;

    switch (mode) {
      case "series":
        result = a.line.seriesName.localeCompare(b.line.seriesName, "es", { sensitivity: "base" });
        break;
      case "material":
        result = a.line.material.localeCompare(b.line.material, "es", { sensitivity: "base" });
        break;
      case "format":
        result = a.line.formatLabel.localeCompare(b.line.formatLabel, "es", {
          sensitivity: "base",
          numeric: true,
        });
        break;
      case "squareMeters": {
        const av = a.line.squareMeters ?? Number.POSITIVE_INFINITY;
        const bv = b.line.squareMeters ?? Number.POSITIVE_INFINITY;
        result = av - bv;
        break;
      }
      case "pricePerM2": {
        const av = a.line.pricePerM2 ?? Number.POSITIVE_INFINITY;
        const bv = b.line.pricePerM2 ?? Number.POSITIVE_INFINITY;
        result = av - bv;
        break;
      }
    }

    if (result !== 0) return result;
    return a.index - b.index;
  });

  return indexed.map(({ line }) => line);
}

export function withSortedOfferLines(
  offer: BulkOfferDetail,
  sort: BulkOfferLineSortMode,
): BulkOfferDetail {
  return { ...offer, lines: sortBulkOfferLines(offer.lines, sort) };
}

export function bulkOfferExportUrl(
  offerId: string,
  kind: "excel" | "pdf",
  options?: { sort?: BulkOfferLineSortMode; disposition?: "inline" | "attachment" },
): string {
  const params = new URLSearchParams();
  params.set("sort", options?.sort ?? "creation");
  if (kind === "pdf" && options?.disposition === "inline") {
    params.set("disposition", "inline");
  }
  return `/api/bulk-offers/${offerId}/export/${kind}?${params.toString()}`;
}
