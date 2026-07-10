import type { CSSProperties } from "react";
import type { OfferItem, OfferTemplate } from "@/lib/offers-types";

/** Alineado con CRM: `article_colors.image_rotation_degrees`. */
export type TileImageRotation = 0 | 90 | 180 | 270;

/** Modos de encaje (CSS `object-fit`). CRM solo usa contain/cover; el resto es extensión del creador. */
export type TileImageObjectFit = "contain" | "cover" | "fill" | "none" | "scale-down";

/** Punto de anclaje cuando hay recorte o bandas (CSS `object-position`). */
export type TileImageObjectPosition =
  | "center"
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top left"
  | "top center"
  | "top right"
  | "center left"
  | "center right"
  | "bottom left"
  | "bottom center"
  | "bottom right";

export type TileImageDisplay = {
  rotationDegrees: TileImageRotation;
  objectFit: TileImageObjectFit;
  objectPosition: TileImageObjectPosition;
  zoomPercent: number;
};

export type TileImageDisplayOverrides = {
  rotationDegrees?: TileImageRotation;
  objectFit?: TileImageObjectFit;
  objectPosition?: TileImageObjectPosition;
  zoomPercent?: number;
};

export const TILE_ROTATION_OPTIONS: { value: `${TileImageRotation}`; label: string }[] = [
  { value: "0", label: "0° — tal cual la foto" },
  { value: "90", label: "90° — sentido horario" },
  { value: "180", label: "180°" },
  { value: "270", label: "270° — sentido horario" },
];

export const TILE_OBJECT_FIT_OPTIONS: {
  value: TileImageObjectFit;
  label: string;
}[] = [
  { value: "contain", label: "Encajar pieza completa" },
  { value: "cover", label: "Rellenar el marco" },
  { value: "scale-down", label: "Reducir si no cabe" },
  { value: "none", label: "Tamaño original" },
  { value: "fill", label: "Estirar al marco" },
];

export const TILE_OBJECT_POSITION_OPTIONS: {
  value: TileImageObjectPosition;
  label: string;
}[] = [
  { value: "center", label: "Centro" },
  { value: "top", label: "Arriba" },
  { value: "bottom", label: "Abajo" },
  { value: "left", label: "Izquierda" },
  { value: "right", label: "Derecha" },
  { value: "top left", label: "Arriba izquierda" },
  { value: "top center", label: "Arriba centro" },
  { value: "top right", label: "Arriba derecha" },
  { value: "center left", label: "Centro izquierda" },
  { value: "center right", label: "Centro derecha" },
  { value: "bottom left", label: "Abajo izquierda" },
  { value: "bottom center", label: "Abajo centro" },
  { value: "bottom right", label: "Abajo derecha" },
];

/** Valores por defecto globales (encajar pieza completa, sin giro ni zoom extra). */
export const DEFAULT_TILE_IMAGE_DISPLAY: TileImageDisplay = {
  rotationDegrees: 0,
  objectFit: "contain",
  objectPosition: "center",
  zoomPercent: 100,
};

/**
 * Ajustes por plantilla. Se aplican después de los globales y antes de los del ítem.
 * `contain` + marco con aspect ratio del formato ayuda a ver piezas alargadas (p. ej. 23×120).
 */
export const TEMPLATE_TILE_IMAGE_DISPLAY: Partial<
  Record<OfferTemplate, Partial<TileImageDisplay>>
> = {
  "split-right": { objectFit: "contain" },
  "minimal-price": { objectFit: "contain" },
  "editorial-left": { objectFit: "contain" },
  "duo-frame": { objectFit: "contain" },
  "catalog-strip": { objectFit: "contain" },
  "tile-dominant": { objectFit: "contain" },
  "clean-card": { objectFit: "contain", zoomPercent: 95 },
  "hero-focus": { objectFit: "contain", zoomPercent: 90 },
  "price-overlay": { objectFit: "contain", zoomPercent: 90 },
  "price-banner": { objectFit: "contain", zoomPercent: 90 },
};

export function normalizeTileImageRotation(raw: unknown): TileImageRotation {
  const n = typeof raw === "number" ? raw : parseInt(String(raw ?? ""), 10);
  if (n === 90 || n === 180 || n === 270) return n;
  return 0;
}

export function normalizeTileImageObjectFit(raw: unknown): TileImageObjectFit {
  if (raw === "cover" || raw === "fill" || raw === "none" || raw === "scale-down") return raw;
  return "contain";
}

const VALID_OBJECT_POSITIONS = new Set<TileImageObjectPosition>(
  TILE_OBJECT_POSITION_OPTIONS.map((o) => o.value),
);

export function normalizeTileImageObjectPosition(raw: unknown): TileImageObjectPosition {
  if (typeof raw === "string" && VALID_OBJECT_POSITIONS.has(raw as TileImageObjectPosition)) {
    return raw as TileImageObjectPosition;
  }
  return "center";
}

export function normalizeTileImageZoomPercent(raw: unknown): number {
  const n = typeof raw === "number" ? raw : parseInt(String(raw ?? ""), 10);
  if (!Number.isFinite(n)) return 100;
  return Math.min(300, Math.max(25, Math.round(n)));
}

/** Extrae ancho/alto del formato (p. ej. "60x120", "23×120") → ratio ancho/alto. */
export function parseFormatAspectRatio(format: string | undefined): number | undefined {
  if (!format) return undefined;
  const match = format.match(/(\d+(?:[,\.]\d+)?)\s*[×xX]\s*(\d+(?:[,\.]\d+)?)/i);
  if (!match) return undefined;
  const width = parseFloat(match[1].replace(",", "."));
  const height = parseFloat(match[2].replace(",", "."));
  if (!Number.isFinite(width) || !Number.isFinite(height) || height <= 0) return undefined;
  return width / height;
}

export function tileImageDisplayFromItem(item: Pick<
  OfferItem,
  "tileRotationDegrees" | "tileObjectFit" | "tileObjectPosition" | "tileZoomPercent"
>): TileImageDisplayOverrides {
  const overrides: TileImageDisplayOverrides = {};
  if (item.tileRotationDegrees !== undefined) {
    overrides.rotationDegrees = normalizeTileImageRotation(item.tileRotationDegrees);
  }
  if (item.tileObjectFit !== undefined) {
    overrides.objectFit = normalizeTileImageObjectFit(item.tileObjectFit);
  }
  if (item.tileObjectPosition !== undefined) {
    overrides.objectPosition = normalizeTileImageObjectPosition(item.tileObjectPosition);
  }
  if (item.tileZoomPercent !== undefined) {
    overrides.zoomPercent = normalizeTileImageZoomPercent(item.tileZoomPercent);
  }
  return overrides;
}

/** item > globalOverrides > plantilla (código) > global (código) */
export function resolveTileImageDisplay(
  template: OfferTemplate,
  itemOverrides?: TileImageDisplayOverrides,
  globalOverrides?: TileImageDisplayOverrides,
): TileImageDisplay {
  const templateDefaults = TEMPLATE_TILE_IMAGE_DISPLAY[template] ?? {};
  return {
    rotationDegrees: normalizeTileImageRotation(
      itemOverrides?.rotationDegrees ??
        globalOverrides?.rotationDegrees ??
        templateDefaults.rotationDegrees ??
        DEFAULT_TILE_IMAGE_DISPLAY.rotationDegrees,
    ),
    objectFit: normalizeTileImageObjectFit(
      itemOverrides?.objectFit ??
        globalOverrides?.objectFit ??
        templateDefaults.objectFit ??
        DEFAULT_TILE_IMAGE_DISPLAY.objectFit,
    ),
    objectPosition: normalizeTileImageObjectPosition(
      itemOverrides?.objectPosition ??
        globalOverrides?.objectPosition ??
        templateDefaults.objectPosition ??
        DEFAULT_TILE_IMAGE_DISPLAY.objectPosition,
    ),
    zoomPercent: normalizeTileImageZoomPercent(
      itemOverrides?.zoomPercent ??
        globalOverrides?.zoomPercent ??
        templateDefaults.zoomPercent ??
        DEFAULT_TILE_IMAGE_DISPLAY.zoomPercent,
    ),
  };
}

export function tileImageObjectFitClass(objectFit: TileImageObjectFit): string {
  return `object-${objectFit}`;
}

export function tileImageStyle(
  rotationDegrees: TileImageRotation,
  zoomPercent: number,
  objectPosition: TileImageObjectPosition,
): CSSProperties | undefined {
  const transform = tileImageTransformStyle(rotationDegrees, zoomPercent);
  const style: CSSProperties = transform ? { ...transform } : {};
  if (objectPosition !== "center") {
    style.objectPosition = objectPosition;
  }
  return Object.keys(style).length ? style : undefined;
}

/** Giro + zoom (misma lógica que practika-web / CRM). */
export function tileImageTransformStyle(
  rotationDegrees: TileImageRotation,
  zoomPercent: number,
): CSSProperties | undefined {
  const zRaw = zoomPercent / 100;
  const z = Math.min(3, Math.max(0.25, zRaw));
  const hasRot = rotationDegrees === 90 || rotationDegrees === 180 || rotationDegrees === 270;
  if (!hasRot && Math.abs(z - 1) < 0.001) return undefined;
  const parts: string[] = [];
  if (hasRot) parts.push(`rotate(${rotationDegrees}deg)`);
  if (Math.abs(z - 1) >= 0.001) parts.push(`scale(${z})`);
  return parts.length ? { transform: parts.join(" ") } : undefined;
}

/** Personalización por plantilla en el builder (activable individualmente). */
export type TemplateTileCustomization = {
  enabled: boolean;
  rotationDegrees: TileImageRotation;
  objectFit: TileImageObjectFit;
  objectPosition: TileImageObjectPosition;
  zoomPercent: number;
};

export function createTemplateTileCustomization(
  base: TileImageDisplay = DEFAULT_TILE_IMAGE_DISPLAY,
): TemplateTileCustomization {
  return {
    enabled: false,
    rotationDegrees: base.rotationDegrees,
    objectFit: base.objectFit,
    objectPosition: base.objectPosition,
    zoomPercent: base.zoomPercent,
  };
}

/** Resuelve la visualización efectiva en el builder (global o personalizada por plantilla). */
export function resolveBuilderTileDisplay(
  template: OfferTemplate,
  globalDisplay: TileImageDisplay,
  templateCustom?: TemplateTileCustomization,
): TileImageDisplay {
  const active = templateCustom?.enabled
    ? {
        rotationDegrees: templateCustom.rotationDegrees,
        objectFit: templateCustom.objectFit,
        objectPosition: templateCustom.objectPosition,
        zoomPercent: templateCustom.zoomPercent,
      }
    : globalDisplay;
  return resolveTileImageDisplay(template, active);
}
