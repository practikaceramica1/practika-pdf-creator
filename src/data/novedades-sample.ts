import type { NovedadesCatalog } from "@/lib/catalog-types";

export const MATERIAL_OPTIONS = [
  "Pasta roja",
  "Pasta roja antihielo",
  "Porcelanico",
  "Porcelanico pulido",
  "Porcelanico mate",
  "Pasta roja rustico",
  "Pasta roja antideslizante",
  "Pasta Roja",
] as const;

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
      type: "legend",
      imageSrc: "/catalog/symbology-reference.png",
      imageAlt: "Simbologia",
    },
    {
      type: "grid",
      columns: 3,
      products: [
        {
          name: "Bambu",
          material: MATERIAL_OPTIONS[0],
          format: "30×60 cm",
          image: {
            src: "/catalog/placeholder-tile.svg",
            alt: "Bambu",
          },
        },
        {
          name: "Binibeca",
          material: MATERIAL_OPTIONS[0],
          format: "30×60 cm",
          image: {
            src: "/catalog/placeholder-tile.svg",
            alt: "Binibeca",
          },
        },
        {
          name: "Nassau",
          material: MATERIAL_OPTIONS[0],
          format: "33,3×33,3 cm",
          image: {
            src: "/catalog/placeholder-tile.svg",
            alt: "Nassau",
          },
        },
        {
          name: "Pool",
          material: MATERIAL_OPTIONS[0],
          format: "33,3×33,3 cm",
          image: {
            src: "/catalog/placeholder-tile.svg",
            alt: "Pool",
          },
        },
        {
          name: "Bahamas",
          material: MATERIAL_OPTIONS[0],
          format: "33,3×33,3 cm",
          image: {
            src: "/catalog/placeholder-tile.svg",
            alt: "Bahamas",
          },
        },
        {
          name: "Blue Sea",
          material: MATERIAL_OPTIONS[0],
          format: "33,3×33,3 cm",
          image: {
            src: "/catalog/placeholder-tile.svg",
            alt: "Blue Sea",
          },
        },
        {
          name: "Coimbra",
          material: MATERIAL_OPTIONS[1],
          format: "33,3×33,3 cm",
          image: {
            src: "/catalog/placeholder-tile.svg",
            alt: "Coimbra",
          },
        },
        {
          name: "Ainsa",
          material: MATERIAL_OPTIONS[1],
          format: "33,3×33,3 cm",
          image: {
            src: "/catalog/placeholder-tile.svg",
            alt: "Ainsa",
          },
        },
        {
          name: "Iberia",
          material: MATERIAL_OPTIONS[0],
          format: "33,3×33,3 cm",
          image: {
            src: "/catalog/placeholder-tile.svg",
            alt: "Iberia",
          },
        },
        {
          name: "Deck",
          material: MATERIAL_OPTIONS[6],
          format: "19×57 cm",
          image: {
            src: "/catalog/placeholder-tile.svg",
            alt: "Deck",
          },
        },
        {
          name: "One",
          material: MATERIAL_OPTIONS[0],
          format: "30×60 cm",
          image: {
            src: "/catalog/placeholder-tile.svg",
            alt: "One",
          },
        },
        {
          name: "Blanco Mate C3",
          material: MATERIAL_OPTIONS[6],
          format: "33,3×33,3 cm",
          image: {
            src: "/catalog/placeholder-tile.svg",
            alt: "Blanco Mate C3",
          },
        },
        {
          name: "Blanco Pulido + Negro Pulido",
          material: MATERIAL_OPTIONS[3],
          format: "60×60 cm",
          image: {
            src: "/catalog/placeholder-tile.svg",
            alt: "Blanco Pulido + Negro Pulido",
          },
        },
        {
          name: "Tokyo / London",
          material: MATERIAL_OPTIONS[4],
          format: "60×120 cm",
          image: {
            src: "/catalog/placeholder-tile.svg",
            alt: "Tokyo / London",
          },
        },
        {
          name: "Miranda",
          material: MATERIAL_OPTIONS[5],
          format: "45×45 cm",
          image: {
            src: "/catalog/placeholder-tile.svg",
            alt: "Miranda",
          },
        },
        {
          name: "Medina",
          material: MATERIAL_OPTIONS[5],
          format: "45×45 cm",
          image: {
            src: "/catalog/placeholder-tile.svg",
            alt: "Medina",
          },
        },
        {
          name: "Rustico",
          material: MATERIAL_OPTIONS[5],
          format: "45×45 cm",
          image: {
            src: "/catalog/placeholder-tile.svg",
            alt: "Rustico",
          },
        },
        {
          name: "Pool Bali",
          format: "30×60 cm",
          image: {
            src: "/catalog/placeholder-tile.svg",
            alt: "Pool Bali",
          },
        },
        {
          name: "Peldano",
          image: {
            src: "/catalog/placeholder-tile.svg",
            alt: "Peldano",
          },
        },
        {
          name: "23×120 Halcon",
          format: "23×120 cm",
          image: {
            src: "/catalog/placeholder-tile.svg",
            alt: "23×120 Halcon",
          },
        },
      ],
    },
  ],
};
