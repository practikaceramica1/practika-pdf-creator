export type ColorVariantType = "regular" | "decor" | "relieve" | "c3";

export function normalizeColorVariantType(raw: string | null | undefined): ColorVariantType {
  if (raw === "decor" || raw === "relieve" || raw === "c3") return raw;
  return "regular";
}

export function colorVariantTypeLabel(variantType: ColorVariantType): string {
  switch (variantType) {
    case "decor":
      return "Decor";
    case "relieve":
      return "Relieve";
    case "c3":
      return "Antideslizante (C3/R11)";
    default:
      return "Regular";
  }
}

type ColorSibling = { name: string; variantType: ColorVariantType };

export function buildColorDisplayLabel(
  colorName: string,
  variantType: ColorVariantType,
  _siblings: ColorSibling[],
): string {
  const normalizedName = colorName.trim();
  if (variantType === "regular") return normalizedName;
  return `${normalizedName} · ${colorVariantTypeLabel(variantType)}`;
}

/** Normaliza nombres guardados antes del cambio de etiquetas (p. ej. "BEIGE · Regular"). */
export function formatColorNameForExport(colorName: string): string {
  return colorName.replace(/\s·\sRegular\s*$/i, "").trim();
}

export function compareArticleColorsLikeWeb(
  a: { name: string; sortOrder: number },
  b: { name: string; sortOrder: number },
): number {
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  return a.name.localeCompare(b.name, "es", { sensitivity: "accent" });
}

/** @deprecated Use compareArticleColorsLikeWeb — kept as alias for callers. */
export function compareColorOptions(
  a: { name: string; variantType: ColorVariantType; sortOrder: number },
  b: { name: string; variantType: ColorVariantType; sortOrder: number },
): number {
  return compareArticleColorsLikeWeb(a, b);
}
