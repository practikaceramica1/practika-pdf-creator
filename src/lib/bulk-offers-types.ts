import type { ColorVariantType } from "@/lib/color-variant-label";

export type BulkOfferColorOption = {
  id: string;
  name: string;
  displayLabel: string;
  variantType: ColorVariantType;
  image?: string;
  status: string;
};

export type BulkOfferProductRow = {
  seriesId: string;
  seriesName: string;
  seriesSlug: string;
  seriesStatus: string;
  formatMaterialId: string;
  formatMaterialStatus: string;
  material: string;
  formatLabel: string;
  formatDisplay: string;
  colors: BulkOfferColorOption[];
};

export type BulkOfferLineDraft = {
  id: string;
  seriesName: string;
  material: string;
  formatLabel: string;
  formatDisplay: string;
  colorName: string;
  squareMeters: number | null;
  pricePerM2: number | null;
  comments: string;
  imageUrl: string;
  customImageData: string;
  isManual: boolean;
  crmSeriesId?: string;
  crmFormatMaterialId?: string;
  crmColorId?: string;
  seriesStatus?: string;
};

export type BulkOfferSummary = {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lineCount: number;
};

export type BulkOfferDetail = BulkOfferSummary & {
  lines: BulkOfferLineDraft[];
};

export function resolveLineImage(line: Pick<BulkOfferLineDraft, "customImageData" | "imageUrl">): string {
  return line.customImageData || line.imageUrl || "";
}

export function lineTotal(line: Pick<BulkOfferLineDraft, "squareMeters" | "pricePerM2">): number | null {
  if (line.squareMeters == null || line.pricePerM2 == null) return null;
  return line.squareMeters * line.pricePerM2;
}

const DECIMAL_DRAFT_RE = /^-?\d*(?:[.,]\d*)?$/;

/** Permite escribir decimales con `.` o `,` sin perder el separador a mitad de tecleo. */
export function isDecimalDraft(value: string): boolean {
  return value === "" || DECIMAL_DRAFT_RE.test(value);
}

export function parseDecimalInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "." || trimmed === "," || trimmed === "-") return null;
  const parsed = Number(trimmed.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatDecimalInput(value: number | null): string {
  return value == null ? "" : String(value);
}

export function newManualLine(): BulkOfferLineDraft {
  return {
    id: crypto.randomUUID(),
    seriesName: "",
    material: "",
    formatLabel: "",
    formatDisplay: "",
    colorName: "",
    squareMeters: null,
    pricePerM2: null,
    comments: "",
    imageUrl: "",
    customImageData: "",
    isManual: true,
  };
}

export function productRowToLine(
  row: BulkOfferProductRow,
  color: BulkOfferColorOption,
  squareMeters: number,
  pricePerM2: number,
  comments: string,
): BulkOfferLineDraft {
  return {
    id: crypto.randomUUID(),
    seriesName: row.seriesName,
    material: row.material,
    formatLabel: row.formatLabel,
    formatDisplay: row.formatDisplay,
    colorName: color.displayLabel,
    squareMeters,
    pricePerM2,
    comments,
    imageUrl: color.image || "",
    customImageData: "",
    isManual: false,
    crmSeriesId: row.seriesId,
    crmFormatMaterialId: row.formatMaterialId,
    crmColorId: color.id,
    seriesStatus: row.seriesStatus,
  };
}
