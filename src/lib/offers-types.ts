import type { TileImageObjectFit, TileImageObjectPosition, TileImageRotation } from "@/lib/tileImageDisplay";

export type OfferTemplate =
  | "split-right"
  | "price-overlay"
  | "clean-card"
  | "hero-focus"
  | "catalog-strip"
  | "minimal-price"
  | "price-banner"
  | "duo-frame"
  | "editorial-left"
  | "tile-dominant";

/** Variantes de logo en `/public/brand/` (misma convención que la web pública). */
export type LogoVariant = "white" | "anthracite" | "beige" | "blue";

export type { TileImageObjectFit, TileImageObjectPosition, TileImageRotation } from "@/lib/tileImageDisplay";

const LOGO_PATH: Record<LogoVariant, string> = {
  white: "/brand/logo-white.png",
  anthracite: "/brand/logo-anthracite.png",
  beige: "/brand/logo-beige.png",
  blue: "/brand/logo-blue.png",
};

export function logoSrcForVariant(variant: LogoVariant): string {
  return LOGO_PATH[variant];
}

export type OfferItem = {
  series: string;
  color?: string;
  format?: string;
  material?: string;
  pricePerM2: string;
  heroImage: string;
  tileImage?: string;
  specialOfferText?: string;
  template?: OfferTemplate;
  /** Si no se indica, el PDF usa blanco / antracita según la plantilla. */
  logoVariant?: LogoVariant;
  /** Giro de la pieza suelta en sentido horario (0, 90, 180, 270). CRM: `image_rotation_degrees`. */
  tileRotationDegrees?: TileImageRotation;
  /** Encaje de la pieza en su marco. CRM: `image_web_object_fit` (contain/cover); también fill, none, scale-down. */
  tileObjectFit?: TileImageObjectFit;
  /** Punto de anclaje dentro del marco (útil con cover o zoom). CSS `object-position`. */
  tileObjectPosition?: TileImageObjectPosition;
  /** Zoom adicional de la pieza, % (25–300; 100 = sin escala extra). CRM: `image_web_zoom_percent`. */
  tileZoomPercent?: number;
};

export type OffersCatalog = {
  id: string;
  pages: OfferItem[];
};
