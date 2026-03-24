import type { NovedadesCatalog } from "@/lib/catalog-types";

/**
 * Ejemplo: sustituye rutas de imagen por archivos en /public
 * (p. ej. public/catalogo/novedades/hero.jpg → /catalogo/novedades/hero.jpg).
 */
export const sampleNovedadesCatalog: NovedadesCatalog = {
  id: "novedades-2025-demo",
  pages: [
    {
      type: "cover",
      title: "NOVEDADES",
      subtitle: "Practika Cerámica",
      season: "Primavera 2025",
      hero: {
        src: "/catalog/placeholder-hero.svg",
        alt: "Ambientación cerámica",
      },
    },
    {
      type: "section",
      heading: "Colección",
      body:
        "Texto breve de presentación. Sustituye este bloque por copy real de marketing.",
    },
    {
      type: "grid",
      columns: 3,
      products: [
        {
          sku: "PK-1001",
          name: "Caliza Pearl",
          format: "30×60 cm",
          image: {
            src: "/catalog/placeholder-tile.svg",
            alt: "Caliza Pearl",
          },
        },
        {
          sku: "PK-1002",
          name: "Stone Grey",
          format: "60×60 cm",
          image: {
            src: "/catalog/placeholder-tile.svg",
            alt: "Stone Grey",
          },
        },
        {
          sku: "PK-1003",
          name: "Urban White",
          format: "30×90 cm",
          image: {
            src: "/catalog/placeholder-tile.svg",
            alt: "Urban White",
          },
        },
        {
          sku: "PK-1004",
          name: "Madera Roble",
          format: "20×120 cm",
          image: {
            src: "/catalog/placeholder-tile.svg",
            alt: "Madera Roble",
          },
        },
        {
          sku: "PK-1005",
          name: "Metal Rust",
          format: "45×45 cm",
          image: {
            src: "/catalog/placeholder-tile.svg",
            alt: "Metal Rust",
          },
        },
        {
          sku: "PK-1006",
          name: "Marfil Brillo",
          format: "25×75 cm",
          image: {
            src: "/catalog/placeholder-tile.svg",
            alt: "Marfil Brillo",
          },
        },
      ],
    },
  ],
};
