import "server-only";

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** Tokens alineados con practika-web `globals.css` y CartDrawer PDF. */
export const PRACTIKA_BRAND = {
  navy: { rgb: [26, 31, 61] as const, argb: "FF1A1F3D" },
  navyLight: { rgb: [42, 49, 86] as const, argb: "FF2A3156" },
  navyBanner: { rgb: [52, 61, 92] as const, argb: "FF343C5C" },
  accent: { rgb: [245, 158, 11] as const, argb: "FFF59E0B" },
  accentDark: { rgb: [217, 119, 6] as const, argb: "FFD97706" },
  highlight: { rgb: [229, 236, 250] as const, argb: "FFE5ECFA" },
  rowAlt: { rgb: [248, 249, 252] as const, argb: "FFF8F9FC" },
  border: { rgb: [220, 226, 236] as const, argb: "FFDCE2EC" },
  text: { rgb: [23, 23, 23] as const, argb: "FF171717" },
  muted: { rgb: [107, 114, 128] as const, argb: "FF6B7280" },
  white: { rgb: [255, 255, 255] as const, argb: "FFFFFFFF" },
} as const;

export const LOGO_ASPECT = 1182 / 611;

/** Altura del logo en cabecera de exportaciones (PDF mm / Excel px). */
export const EXPORT_HEADER_LOGO_HEIGHT_MM = 17;
export const EXPORT_HEADER_LOGO_HEIGHT_PX = 72;

export type BrandLogoVariant = "white" | "anthracite" | "beige" | "blue";

export function loadBrandLogoBuffer(variant: BrandLogoVariant = "anthracite"): Buffer | null {
  const path = join(process.cwd(), "public", "brand", `logo-${variant}.png`);
  if (!existsSync(path)) return null;
  return readFileSync(path);
}

export function brandLogoDataUrl(variant: BrandLogoVariant = "anthracite"): string | null {
  const buffer = loadBrandLogoBuffer(variant);
  if (!buffer) return null;
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

export function formatOfferDocumentDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatOfferDocumentMeta(isoDate: string, lineCount: number): string {
  return `${formatOfferDocumentDate(isoDate)} · ${lineCount} ${lineCount === 1 ? "línea" : "líneas"}`;
}

export const EXPORT_FONT = "Calibri";
