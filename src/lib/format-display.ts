export function roundFormatCm(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 10) / 10;
}

export function formatLabelFromCm(widthCm: number, heightCm: number): string {
  const part = (n: number) => String(roundFormatCm(n)).replace(".", ",");
  return `${part(widthCm)}x${part(heightCm)}`;
}

export function formatLabelDisplay(label: string): string {
  const clean = label.replace(/×/g, "x").trim();
  const [w, h] = clean.split("x");
  if (!w || !h) return label;
  return `${w} × ${h} cm`;
}

export type FormatShapeKind = "square" | "wide" | "tall" | "standard";

export function classifyFormatShape(widthCm: number, heightCm: number): FormatShapeKind {
  if (!widthCm || !heightCm) return "standard";
  const ratio = widthCm / heightCm;
  if (ratio >= 0.92 && ratio <= 1.08) return "square";
  if (ratio >= 1.45) return "wide";
  if (ratio <= 0.69) return "tall";
  return "standard";
}

export function formatShapeLabel(kind: FormatShapeKind): string {
  switch (kind) {
    case "square":
      return "Cuadrado";
    case "wide":
      return "Rectangular alargado";
    case "tall":
      return "Rectangular vertical";
    default:
      return "Rectangular";
  }
}

/** Dimensiones normalizadas para dibujar la silueta (max 1). */
export function formatShapeDimensions(widthCm: number, heightCm: number): { w: number; h: number } {
  const w = Math.max(widthCm, 1);
  const h = Math.max(heightCm, 1);
  const max = Math.max(w, h);
  return { w: w / max, h: h / max };
}
