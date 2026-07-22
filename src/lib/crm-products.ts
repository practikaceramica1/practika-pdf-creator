import "server-only";

import { formatLabelFromCm } from "@/lib/format-display";
import type { BulkOfferProductRow } from "@/lib/bulk-offers-types";
import {
  buildColorDisplayLabel,
  compareArticleColorsLikeWeb,
  normalizeColorVariantType,
} from "@/lib/color-variant-label";
import { buildStoragePublicUrl } from "@/lib/storage-public-url";
import { createClient } from "@/lib/supabase/server";

function parseFormatForSort(label: string): [number, number] {
  const clean = label.replace(",", ".").toLowerCase();
  const [w, h] = clean.split("x");
  return [Number(w) || 0, Number(h) || 0];
}

export async function fetchBulkOfferProductRows(): Promise<BulkOfferProductRow[]> {
  const supabase = await createClient();

  const { data: series, error: seriesError } = await supabase
    .from("series")
    .select("id,name,slug,status")
    .order("name");
  if (seriesError) throw new Error(seriesError.message);

  const seriesIds = (series || []).map((s) => s.id);
  if (!seriesIds.length) return [];

  const { data: formats, error: formatsError } = await supabase
    .from("format_materials")
    .select("id,series_id,format_label,width_cm,height_cm,status,materials(name)")
    .in("series_id", seriesIds);
  if (formatsError) throw new Error(formatsError.message);

  const formatIds = (formats || []).map((f) => f.id);
  const { data: colors, error: colorsError } =
    formatIds.length > 0
      ? await supabase
          .from("article_colors")
          .select("id,format_material_id,color_name,variant_type,status,sku,sort_order")
          .in("format_material_id", formatIds)
          .order("sort_order", { ascending: true })
      : { data: [], error: null };
  if (colorsError) throw new Error(colorsError.message);

  const seriesById = new Map((series || []).map((s) => [s.id, s]));
  const colorsByFormat = new Map<string, typeof colors>();
  for (const c of colors || []) {
    const arr = colorsByFormat.get(c.format_material_id) || [];
    arr.push(c);
    colorsByFormat.set(c.format_material_id, arr);
  }
  for (const [formatId, arr] of colorsByFormat) {
    arr.sort(
      (a, b) =>
        Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0) ||
        String(a.color_name || "").localeCompare(String(b.color_name || ""), "es"),
    );
    colorsByFormat.set(formatId, arr);
  }

  const rows: BulkOfferProductRow[] = [];

  for (const f of formats || []) {
    const s = seriesById.get(f.series_id);
    if (!s) continue;

    const material = Array.isArray(f.materials) ? f.materials[0] : f.materials;
    const w = Number(f.width_cm);
    const h = Number(f.height_cm);
    const formatLabel =
      Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0
        ? formatLabelFromCm(w, h)
        : f.format_label || "";

    const rawColors = (colorsByFormat.get(f.id) || [])
      .filter((c) => c.color_name)
      .map((c) => ({
        id: c.id,
        name: c.color_name!.trim(),
        variantType: normalizeColorVariantType(c.variant_type),
        sortOrder: Number(c.sort_order) || 0,
        image: c.sku ? buildStoragePublicUrl("r2", c.sku) : undefined,
        status: c.status || "published",
      }));

    const siblings = rawColors.map((c) => ({ name: c.name, variantType: c.variantType }));
    const formatColors = rawColors
      .sort(compareArticleColorsLikeWeb)
      .map((c) => ({
        ...c,
        displayLabel: buildColorDisplayLabel(c.name, c.variantType, siblings),
      }));

    rows.push({
      seriesId: s.id,
      seriesName: s.name,
      seriesSlug: s.slug,
      seriesStatus: s.status || "published",
      formatMaterialId: f.id,
      formatMaterialStatus: f.status || "published",
      material: material?.name ?? "",
      formatLabel,
      formatDisplay: formatLabel ? `${formatLabel.replace("x", " × ")} cm` : "",
      colors: formatColors,
    });
  }

  rows.sort((a, b) => {
    const byName = a.seriesName.localeCompare(b.seriesName, "es");
    if (byName !== 0) return byName;
    const [aw, ah] = parseFormatForSort(a.formatLabel);
    const [bw, bh] = parseFormatForSort(b.formatLabel);
    if (aw !== bw) return aw - bw;
    return ah - bh;
  });

  return rows;
}

export async function fetchBulkOfferMaterials(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("materials").select("name").eq("is_active", true).order("name");
  if (error) throw new Error(error.message);
  return [...new Set((data || []).map((m) => m.name).filter(Boolean))];
}
