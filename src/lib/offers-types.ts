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
};

export type OffersCatalog = {
  id: string;
  pages: OfferItem[];
};
