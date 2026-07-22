import "server-only";

import type { BulkOfferDetail } from "@/lib/bulk-offers-types";
import { lineTotal, resolveLineImage } from "@/lib/bulk-offers-types";

export async function fetchImageBuffer(
  url: string,
): Promise<{ buffer: Buffer; extension: "jpeg" | "png" | "gif" } | null> {
  if (!url) return null;
  try {
    if (url.startsWith("data:")) {
      const match = url.match(/^data:image\/(jpeg|jpg|png|gif);base64,(.+)$/i);
      if (!match) return null;
      const ext = match[1].toLowerCase() === "jpg" ? "jpeg" : (match[1].toLowerCase() as "jpeg" | "png" | "gif");
      return { buffer: Buffer.from(match[2], "base64"), extension: ext };
    }
    const res = await fetch(url);
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "";
    const extension = contentType.includes("png") ? "png" : contentType.includes("gif") ? "gif" : "jpeg";
    const arrayBuffer = await res.arrayBuffer();
    return { buffer: Buffer.from(arrayBuffer), extension };
  } catch {
    return null;
  }
}

export function formatMoney(value: number | null): string {
  if (value == null) return "";
  return value.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatNumber(value: number | null): string {
  if (value == null) return "";
  return value.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function sanitizeFilename(name: string): string {
  return name
    .trim()
    .replace(/[^\w\s-áéíóúñÁÉÍÓÚÑ]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80) || "oferta-practika";
}

export function formatOfferSummaryForPdf(offer: BulkOfferDetail) {
  return offer.lines.map((line) => ({
    series: line.seriesName,
    material: line.material,
    format: line.formatDisplay || line.formatLabel,
    color: line.colorName,
    squareMeters: formatNumber(line.squareMeters),
    pricePerM2: formatMoney(line.pricePerM2),
    total: formatMoney(lineTotal(line)),
    comments: line.comments,
    image: resolveLineImage(line),
  }));
}

export async function loadLineImages(offer: BulkOfferDetail) {
  return Promise.all(
    offer.lines.map(async (line) => {
      const image = await fetchImageBuffer(resolveLineImage(line));
      if (!image) return null;
      const format = image.extension === "png" ? "PNG" : image.extension === "gif" ? "GIF" : "JPEG";
      return `data:image/${format.toLowerCase()};base64,${image.buffer.toString("base64")}`;
    }),
  );
}
