/**
 * Modelo del generador de catálogos (flexible, exportable a JSON / PDF).
 * Paleta orientada a impresión: piedra, blanco, antracita, beige (sin azul dominante).
 */

export type CatalogThemeId = "heritage-stone" | "editorial-light" | "stone-contrast";

export const CATALOG_THEMES: { id: CatalogThemeId; label: string; hint: string }[] = [
  {
    id: "heritage-stone",
    label: "Piedra catálogo",
    hint: "Fondo PANTONE 7534 C aprox., como PDF corporativo tradicional",
  },
  {
    id: "editorial-light",
    label: "Editorial claro",
    hint: "Blanco y beige, texto antracita; ideal para PDFs limpios",
  },
  {
    id: "stone-contrast",
    label: "Piedra + franja",
    hint: "Páginas claras con cabeceras antracita",
  },
];

export type CatalogProduct = {
  id: string;
  name: string;
  material?: string;
  format?: string;
  imageSrc?: string;
  notes?: string;
};

export type ContentBlock =
  | { id: string; kind: "heading"; text: string }
  | { id: string; kind: "paragraph"; text: string }
  | { id: string; kind: "image"; src: string; caption?: string };

export type CatalogPageType = CatalogPage["type"];

export type CatalogPage =
  | {
      id: string;
      type: "cover";
      title: string;
      subtitle?: string;
      season?: string;
      heroSrc?: string;
    }
  | {
      id: string;
      type: "section";
      heading: string;
      body?: string;
    }
  | {
      id: string;
      type: "legend";
      imageSrc?: string;
      imageAlt?: string;
    }
  | {
      id: string;
      type: "grid";
      columns: 2 | 3 | 4;
      products: CatalogProduct[];
    }
  | {
      id: string;
      type: "blocks";
      blocks: ContentBlock[];
    };

export type CatalogDocument = {
  id: string;
  name: string;
  theme: CatalogThemeId;
  pages: CatalogPage[];
};

export const STORAGE_KEY = "practika-catalog-draft";

export function newId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function emptyProduct(): CatalogProduct {
  return {
    id: newId(),
    name: "Nuevo producto",
    material: "",
    format: "",
    imageSrc: undefined,
    notes: "",
  };
}

export function createPage(type: CatalogPageType): CatalogPage {
  switch (type) {
    case "cover":
      return {
        id: newId(),
        type: "cover",
        title: "CATÁLOGO",
        subtitle: "Practika Cerámica",
        season: "",
        heroSrc: undefined,
      };
    case "section":
      return { id: newId(), type: "section", heading: "Colección", body: "" };
    case "legend":
      return { id: newId(), type: "legend", imageSrc: undefined, imageAlt: "Simbología" };
    case "grid":
      return {
        id: newId(),
        type: "grid",
        columns: 3,
        products: [emptyProduct(), emptyProduct(), emptyProduct()],
      };
    case "blocks":
      return {
        id: newId(),
        type: "blocks",
        blocks: [
          { id: newId(), kind: "heading", text: "Título de página" },
          { id: newId(), kind: "paragraph", text: "Texto descriptivo. Puedes añadir más bloques y reordenarlos." },
        ],
      };
    default:
      return createPage("section");
  }
}

export function createEmptyCatalog(): CatalogDocument {
  return {
    id: newId(),
    name: "Catálogo sin título",
    theme: "heritage-stone",
    pages: [createPage("cover"), createPage("section"), createPage("grid")],
  };
}
