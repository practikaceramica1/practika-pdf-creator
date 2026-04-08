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
};

export type OffersCatalog = {
  id: string;
  pages: OfferItem[];
};
