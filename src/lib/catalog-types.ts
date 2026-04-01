/** Catálogo de novedades: datos por página (portada, rejillas de producto, etc.). */

export type CatalogImage = {
  src: string;
  alt: string;
  widthMm?: number;
  heightMm?: number;
};

export type ProductTile = {
  name: string;
  /** Opción seleccionada de `MATERIAL_OPTIONS` */
  material?: string;
  /** p. ej. "30×60 cm" */
  format?: string;
  /** Ruta bajo /public */
  image?: CatalogImage;
  notes?: string;
};

export type NovedadesPage =
  | {
      type: "cover";
      title: string;
      subtitle?: string;
      season?: string;
      hero?: CatalogImage;
    }
  | {
      type: "legend";
      /** Si no se indica, usa la referencia importada de página 4 */
      imageSrc?: string;
      imageAlt?: string;
    }
  | {
      type: "section";
      heading: string;
      body?: string;
    }
  | {
      type: "grid";
      columns: 2 | 3 | 4;
      products: ProductTile[];
    };

export type NovedadesCatalog = {
  /** Identificador interno / nombre de archivo sugerido */
  id: string;
  pages: NovedadesPage[];
};
