import type { OffersCatalog } from "@/lib/offers-types";

export const sampleOffersCatalog: OffersCatalog = {
  id: "ofertas-2026-demo",
  pages: [
    {
      series: "PALAZZO",
      color: "PERLA",
      format: "60x120",
      material: "Porcelanico",
      pricePerM2: "7,50 EUR/m2",
      specialOfferText: "Special offer",
      template: "split-right",
      heroImage: "/catalog/placeholder-hero.svg",
      tileImage: "/catalog/placeholder-tile.svg",
    },
    {
      series: "MAGNUM",
      color: "BONE",
      format: "90x90",
      material: "Pasta roja",
      pricePerM2: "9,95 EUR/m2",
      specialOfferText: "Special offer",
      template: "price-overlay",
      heroImage: "/catalog/placeholder-hero.svg",
      tileImage: "/catalog/placeholder-tile.svg",
    },
    {
      series: "BALI",
      color: "AZUL",
      format: "30x60",
      material: "Pasta roja",
      pricePerM2: "6,90 EUR/m2",
      specialOfferText: "Special offer",
      template: "clean-card",
      heroImage: "/catalog/placeholder-hero.svg",
      tileImage: "/catalog/placeholder-tile.svg",
    },
  ],
};
