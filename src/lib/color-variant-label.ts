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
  siblings: ColorSibling[],
): string {
  const normalizedName = colorName.trim();
  const sameNameCount = siblings.filter(
    (s) => s.name.localeCompare(normalizedName, "es", { sensitivity: "accent" }) === 0,
  ).length;

  if (sameNameCount > 1 || variantType !== "regular") {
    return `${normalizedName} · ${colorVariantTypeLabel(variantType)}`;
  }
  return normalizedName;
}

export function compareColorOptions(
  a: { name: string; variantType: ColorVariantType; sortOrder: number },
  b: { name: string; variantType: ColorVariantType; sortOrder: number },
): number {
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  const byName = a.name.localeCompare(b.name, "es", { sensitivity: "accent" });
  if (byName !== 0) return byName;
  return colorVariantTypeLabel(a.variantType).localeCompare(colorVariantTypeLabel(b.variantType), "es");
}
