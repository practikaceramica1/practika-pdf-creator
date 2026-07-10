export type DossierTechFilters = {
  finishCut: string[];
  finishSurface: string[];
  thickness: string[];
  style: string[];
  surfaceType: string[];
  effect: string[];
};

export type DossierColor = {
  id: string;
  name: string;
  image?: string;
  variantType: "regular" | "decor" | "relieve" | "c3";
};

export type DossierFormat = {
  id: string;
  formatLabel: string;
  widthCm: number;
  heightCm: number;
  materialName: string;
  colors: DossierColor[];
} & Partial<DossierTechFilters>;

export type CrmSeriesSummary = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  collection?: string;
  isNew?: boolean;
  ambientes: string[];
  heroImage?: string;
  materials: string[];
  formats: string[];
} & DossierTechFilters;

export type CrmSeriesDetail = CrmSeriesSummary & {
  catalogFormats: DossierFormat[];
};

export type DossierDocument = {
  seriesId: string;
  seriesName: string;
  subtitle: string;
  season: string;
  intro: string;
  heroImage: string;
  ambientImages: string[];
  materials: string[];
  catalogFormats: DossierFormat[];
  tech: DossierTechFilters;
};

export const DOSSIER_STORAGE_KEY = "practika-dossier-draft";

export const TECH_FILTER_LABELS: Record<keyof DossierTechFilters, string> = {
  finishCut: "Acabado corte",
  finishSurface: "Acabado superficial",
  thickness: "Espesor",
  style: "Estilo",
  surfaceType: "Tipo",
  effect: "Efecto",
};

export function emptyTechFilters(): DossierTechFilters {
  return {
    finishCut: [],
    finishSurface: [],
    thickness: [],
    style: [],
    surfaceType: [],
    effect: [],
  };
}

export function mergeTechFilters(...sources: Partial<DossierTechFilters>[]): DossierTechFilters {
  const out = emptyTechFilters();
  for (const src of sources) {
    for (const key of Object.keys(out) as (keyof DossierTechFilters)[]) {
      const vals = src[key];
      if (!vals?.length) continue;
      out[key] = [...new Set([...out[key], ...vals])].sort((a, b) => a.localeCompare(b, "es"));
    }
  }
  return out;
}

export function seriesToDossier(series: CrmSeriesDetail, overrides?: Partial<DossierDocument>): DossierDocument {
  const hero = series.heroImage || series.ambientes[0] || "/catalog/placeholder-hero.svg";
  return {
    seriesId: series.id,
    seriesName: series.name,
    subtitle: "Practika Cerámica",
    season: new Date().getFullYear().toString(),
    intro:
      series.description?.trim() ||
      `Colección ${series.name}. Cerámica de calidad Practika para proyectos residenciales y comerciales.`,
    heroImage: hero,
    ambientImages: series.ambientes.length ? series.ambientes : [hero],
    materials: series.materials,
    catalogFormats: series.catalogFormats,
    tech: mergeTechFilters(series, ...series.catalogFormats),
    ...overrides,
  };
}

export function collectDossierColors(formats: DossierFormat[], limit = 12): DossierColor[] {
  const seen = new Set<string>();
  const out: DossierColor[] = [];
  for (const fmt of formats) {
    for (const c of fmt.colors) {
      const key = `${c.name}-${c.variantType}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(c);
      if (out.length >= limit) return out;
    }
  }
  return out;
}
