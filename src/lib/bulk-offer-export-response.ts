import "server-only";

import { parseBulkOfferLineSortMode, withSortedOfferLines } from "@/lib/bulk-offer-line-sort";
import type { BulkOfferDetail } from "@/lib/bulk-offers-types";

export function resolveBulkOfferForExport(request: Request, offer: BulkOfferDetail): BulkOfferDetail {
  const url = new URL(request.url);
  const sort = parseBulkOfferLineSortMode(url.searchParams.get("sort"));
  return withSortedOfferLines(offer, sort);
}

export function pdfContentDisposition(request: Request, filename: string): string {
  const url = new URL(request.url);
  const inline = url.searchParams.get("disposition") === "inline";
  const type = inline ? "inline" : "attachment";
  return `${type}; filename="${filename}"`;
}
