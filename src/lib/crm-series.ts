import "server-only";

import { mapFilterGroup } from "@/lib/catalog-filter-group-map";
import { formatLabelFromCm } from "@/lib/format-display";
import type { CrmSeriesDetail, CrmSeriesSummary, DossierColor, DossierFormat, DossierTechFilters } from "@/lib/dossier-types";
import { emptyTechFilters } from "@/lib/dossier-types";
import { buildStoragePublicUrl } from "@/lib/storage-public-url";
import { createCatalogSupabaseClient } from "@/lib/supabase/server";

type FilterKey = keyof DossierTechFilters;

type FilterBucket = Record<FilterKey, Set<string>>;

function createEmptyFilterBucket(): FilterBucket {
  return {
    finishCut: new Set(),
    finishSurface: new Set(),
    thickness: new Set(),
    style: new Set(),
    surfaceType: new Set(),
    effect: new Set(),
  };
}

function serialiseFilterBucket(b: FilterBucket | undefined): Partial<DossierTechFilters> {
  if (!b) return {};
  const sortEs = (s: Set<string>) => [...s].sort((a, b) => a.localeCompare(b, "es"));
  const out: Partial<DossierTechFilters> = {};
  if (b.finishCut.size) out.finishCut = sortEs(b.finishCut);
  if (b.finishSurface.size) out.finishSurface = sortEs(b.finishSurface);
  if (b.thickness.size) out.thickness = sortEs(b.thickness);
  if (b.style.size) out.style = sortEs(b.style);
  if (b.surfaceType.size) out.surfaceType = sortEs(b.surfaceType);
  if (b.effect.size) out.effect = sortEs(b.effect);
  return out;
}

function parseFormatForSort(label: string): [number, number] {
  const clean = label.replace(",", ".").toLowerCase();
  const [w, h] = clean.split("x");
  return [Number(w) || 0, Number(h) || 0];
}

export async function fetchCrmSeriesList(): Promise<CrmSeriesSummary[]> {
  const all = await fetchAllSeriesDetails();
  return all.map(({ catalogFormats: _cf, ...summary }) => summary);
}

export async function fetchCrmSeriesBySlug(slug: string): Promise<CrmSeriesDetail | null> {
  const all = await fetchAllSeriesDetails();
  return all.find((s) => s.slug === slug) ?? null;
}

export async function fetchCrmSeriesById(id: string): Promise<CrmSeriesDetail | null> {
  const all = await fetchAllSeriesDetails();
  return all.find((s) => s.id === id) ?? null;
}

async function fetchAllSeriesDetails(): Promise<CrmSeriesDetail[]> {
  const supabase = createCatalogSupabaseClient();

  const { data: series, error: seriesError } = await supabase
    .from("series")
    .select("id,name,slug,description,collection,is_new,status")
    .eq("status", "published")
    .order("name");
  if (seriesError) throw new Error(seriesError.message);

  const seriesIds = (series || []).map((s) => s.id);
  if (!seriesIds.length) return [];

  const [
    { data: formats, error: formatsError },
    { data: assets, error: assetsError },
    { data: seriesFilterRows, error: seriesFilterRowsError },
    { data: filterOptions, error: filterOptionsError },
    { data: filterGroupsRows, error: filterGroupsError },
  ] = await Promise.all([
    supabase
      .from("format_materials")
      .select("id,series_id,format_label,width_cm,height_cm,status,materials(name,slug)")
      .in("series_id", seriesIds)
      .eq("status", "published"),
    supabase
      .from("series_assets")
      .select("series_id,asset_type,file_key,storage_provider,sort_order")
      .in("series_id", seriesIds),
    supabase.from("series_filter_options").select("series_id,filter_option_id").in("series_id", seriesIds),
    supabase.from("filter_options").select("id,label,filter_group_id,filter_groups(key,name)"),
    supabase.from("filter_groups").select("id,key,name"),
  ]);

  if (formatsError) throw new Error(formatsError.message);
  if (seriesFilterRowsError) throw new Error(seriesFilterRowsError.message);
  if (filterOptionsError) throw new Error(filterOptionsError.message);
  if (filterGroupsError) throw new Error(filterGroupsError.message);
  if (assetsError) console.error("[dossier] series_assets:", assetsError.message);

  type ColorRow = {
    id: string;
    format_material_id: string;
    color_name: string | null;
    variant_type: string | null;
    sku: string | null;
  };

  const formatIds = (formats || []).map((f) => f.id);
  const { data: colors, error: colorsError } =
    formatIds.length > 0
      ? await supabase
          .from("article_colors")
          .select("id,format_material_id,color_name,variant_type,status,sku")
          .in("format_material_id", formatIds)
          .eq("status", "published")
      : { data: [] as ColorRow[], error: null as null };
  if (colorsError) throw new Error(colorsError.message);

  const { data: formatMaterialFilterRows } =
    formatIds.length > 0
      ? await supabase
          .from("format_material_filter_options")
          .select("format_material_id,filter_option_id")
          .in("format_material_id", formatIds)
      : { data: [] as { format_material_id: string; filter_option_id: string }[] };

  const filterGroupsById = new Map<string, { key?: string | null; name?: string | null }>();
  for (const g of filterGroupsRows || []) {
    if (g?.id) filterGroupsById.set(g.id, { key: g.key, name: g.name });
  }

  const optionsById = new Map<string, { label: string; mappedGroup: ReturnType<typeof mapFilterGroup> }>();
  for (const opt of filterOptions || []) {
    const embedded = Array.isArray(opt.filter_groups) ? opt.filter_groups[0] : opt.filter_groups;
    const fgId = (opt as { filter_group_id?: string }).filter_group_id;
    const group =
      embedded ?? (fgId && filterGroupsById.has(fgId) ? filterGroupsById.get(fgId)! : null);
    optionsById.set(opt.id, {
      label: opt.label,
      mappedGroup: mapFilterGroup(group),
    });
  }

  const seriesFiltersMap = new Map<string, FilterBucket>();
  const formatMaterialFiltersMap = new Map<string, FilterBucket>();

  function addFilterToBucket(bucket: FilterBucket, mapped: FilterKey, label: string) {
    bucket[mapped].add(label);
  }

  function applyFilterRow(
    filterOptionId: string,
    apply: (mapped: FilterKey, label: string) => void,
  ) {
    const info = optionsById.get(filterOptionId);
    if (!info?.mappedGroup) return;
    const mapped = info.mappedGroup;
    if (
      mapped !== "finishCut" &&
      mapped !== "finishSurface" &&
      mapped !== "thickness" &&
      mapped !== "style" &&
      mapped !== "surfaceType" &&
      mapped !== "effect"
    ) {
      return;
    }
    apply(mapped, info.label);
  }

  for (const row of seriesFilterRows || []) {
    const bucket = seriesFiltersMap.get(row.series_id) || createEmptyFilterBucket();
    applyFilterRow(row.filter_option_id, (mapped, label) => addFilterToBucket(bucket, mapped, label));
    seriesFiltersMap.set(row.series_id, bucket);
  }

  const formatIdToSeriesId = new Map<string, string>();
  for (const f of formats || []) formatIdToSeriesId.set(f.id, f.series_id);

  for (const row of formatMaterialFilterRows || []) {
    const fmBucket = formatMaterialFiltersMap.get(row.format_material_id) || createEmptyFilterBucket();
    applyFilterRow(row.filter_option_id, (mapped, label) => addFilterToBucket(fmBucket, mapped, label));
    formatMaterialFiltersMap.set(row.format_material_id, fmBucket);

    const seriesId = formatIdToSeriesId.get(row.format_material_id);
    if (!seriesId) continue;
    const seriesBucket = seriesFiltersMap.get(seriesId) || createEmptyFilterBucket();
    applyFilterRow(row.filter_option_id, (mapped, label) => addFilterToBucket(seriesBucket, mapped, label));
    seriesFiltersMap.set(seriesId, seriesBucket);
  }

  const formatsBySeries = new Map<string, NonNullable<typeof formats>>();
  for (const f of formats || []) {
    const arr = formatsBySeries.get(f.series_id) || [];
    arr.push(f);
    formatsBySeries.set(f.series_id, arr);
  }

  const colorsByFormat = new Map<string, ColorRow[]>();
  for (const c of colors || []) {
    const arr = colorsByFormat.get(c.format_material_id) || [];
    arr.push(c);
    colorsByFormat.set(c.format_material_id, arr);
  }

  const assetsBySeries = new Map<string, NonNullable<typeof assets>>();
  for (const a of (assetsError ? [] : assets) || []) {
    const arr = assetsBySeries.get(a.series_id) || [];
    arr.push(a);
    assetsBySeries.set(a.series_id, arr);
  }

  return (series || []).map((s) => {
    const seriesFormats = [...(formatsBySeries.get(s.id) || [])].sort((a, b) => {
      const [aw, ah] = parseFormatForSort(a.format_label || "");
      const [bw, bh] = parseFormatForSort(b.format_label || "");
      if (aw !== bw) return aw - bw;
      return ah - bh;
    });

    const materialsSet = new Set<string>();
    const formatsByCanonical = new Map<string, string>();

    const catalogFormats: DossierFormat[] = seriesFormats.map((f) => {
      const material = Array.isArray(f.materials) ? f.materials[0] : f.materials;
      if (material?.name) materialsSet.add(material.name);

      const w = Number(f.width_cm);
      const h = Number(f.height_cm);
      const formatLabel =
        Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0
          ? formatLabelFromCm(w, h)
          : f.format_label || "";
      if (formatLabel) formatsByCanonical.set(formatLabel.toLowerCase(), formatLabel);

      const formatColors = colorsByFormat.get(f.id) || [];
      const dossierColors: DossierColor[] = formatColors
        .filter((c) => c.color_name)
        .map((c) => ({
          id: c.id,
          name: c.color_name!,
          image: c.sku ? buildStoragePublicUrl("r2", c.sku) : undefined,
          variantType:
            c.variant_type === "decor" || c.variant_type === "relieve" || c.variant_type === "c3"
              ? c.variant_type
              : "regular",
        }));

      return {
        id: f.id,
        formatLabel,
        widthCm: w,
        heightCm: h,
        materialName: material?.name ?? "",
        colors: dossierColors,
        ...serialiseFilterBucket(formatMaterialFiltersMap.get(f.id)),
      };
    });

    const rowAssets = [...(assetsBySeries.get(s.id) || [])].sort(
      (a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0),
    );
    const ambientes = rowAssets
      .filter((a) => a.asset_type === "ambient_image")
      .map((a) => buildStoragePublicUrl(a.storage_provider, a.file_key))
      .filter(Boolean);

    const seriesFilters = { ...emptyTechFilters(), ...serialiseFilterBucket(seriesFiltersMap.get(s.id)) };

    return {
      id: s.id,
      name: s.name,
      slug: s.slug,
      description: s.description || undefined,
      collection: s.collection || undefined,
      isNew: Boolean(s.is_new),
      ambientes,
      heroImage: ambientes[0],
      materials: [...materialsSet].sort((a, b) => a.localeCompare(b, "es")),
      formats: [...formatsByCanonical.values()].sort((a, b) => {
        const [aw, ah] = parseFormatForSort(a);
        const [bw, bh] = parseFormatForSort(b);
        if (aw !== bw) return aw - bw;
        return ah - bh;
      }),
      catalogFormats,
      ...seriesFilters,
    } satisfies CrmSeriesDetail;
  });
}
