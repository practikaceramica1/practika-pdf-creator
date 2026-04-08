import type { CatalogDocument } from "@/lib/catalog-builder-types";

export const sampleCatalogDocument: CatalogDocument = {
  id: "sample-catalogo-general",
  name: "Practika · Catálogo general (muestra)",
  theme: "heritage-stone",
  pages: [
    {
      id: "sample-cover",
      type: "cover",
      title: "GENERAL",
      subtitle: "Practika Cerámica",
      season: "2026",
      heroSrc: "/catalog/placeholder-hero.svg",
    },
    {
      id: "sample-section",
      type: "section",
      heading: "Cerámica de calidad",
      body:
        "Texto de introducción al catálogo. Sustituye este párrafo por la propuesta de valor, rangos de formato o notas comerciales.",
    },
    {
      id: "sample-legend",
      type: "legend",
      imageSrc: "/catalog/placeholder-tile.svg",
      imageAlt: "Referencia simbología",
    },
    {
      id: "sample-grid",
      type: "grid",
      columns: 3,
      products: [
        {
          id: "sp-a",
          name: "Serie A",
          material: "Porcelánico",
          format: "60×120 cm",
          imageSrc: "/catalog/placeholder-tile.svg",
        },
        {
          id: "sp-b",
          name: "Serie B",
          material: "Gres",
          format: "30×90 cm",
          imageSrc: "/catalog/placeholder-tile.svg",
        },
        {
          id: "sp-c",
          name: "Serie C",
          material: "Pasta roja",
          format: "20×50 cm",
          imageSrc: "/catalog/placeholder-tile.svg",
        },
      ],
    },
    {
      id: "sample-blocks",
      type: "blocks",
      blocks: [
        { id: "blk-h1", kind: "heading", text: "Notas técnicas" },
        {
          id: "blk-p1",
          kind: "paragraph",
          text: "Los bloques se pueden reordenar en el generador. Añade imágenes de detalle o tablas descriptivas según necesidad.",
        },
      ],
    },
  ],
};
