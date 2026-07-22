import "server-only";

import { randomUUID } from "node:crypto";
import type { BulkOfferDetail, BulkOfferLineDraft, BulkOfferSummary } from "@/lib/bulk-offers-types";
import { createClient } from "@/lib/supabase/server";

type DbOffer = {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

type DbLine = {
  id: string;
  offer_id: string;
  sort_order: number;
  series_name: string;
  material: string | null;
  format_label: string | null;
  color_name: string | null;
  square_meters: number | null;
  price_per_m2: number | null;
  comments: string | null;
  image_url: string | null;
  custom_image_data: string | null;
  is_manual: boolean;
  crm_series_id: string | null;
  crm_format_material_id: string | null;
  crm_color_id: string | null;
  series_status: string | null;
};

function mapLine(row: DbLine): BulkOfferLineDraft {
  const formatLabel = row.format_label || "";
  return {
    id: row.id,
    seriesName: row.series_name,
    material: row.material || "",
    formatLabel,
    formatDisplay: formatLabel ? `${formatLabel.replace("x", " × ")} cm` : "",
    colorName: row.color_name || "",
    squareMeters: row.square_meters == null ? null : Number(row.square_meters),
    pricePerM2: row.price_per_m2 == null ? null : Number(row.price_per_m2),
    comments: row.comments || "",
    imageUrl: row.image_url || "",
    customImageData: row.custom_image_data || "",
    isManual: row.is_manual,
    crmSeriesId: row.crm_series_id || undefined,
    crmFormatMaterialId: row.crm_format_material_id || undefined,
    crmColorId: row.crm_color_id || undefined,
    seriesStatus: row.series_status || undefined,
  };
}

function mapLineToDb(line: BulkOfferLineDraft, offerId: string, sortOrder: number) {
  return {
    id: line.id,
    offer_id: offerId,
    sort_order: sortOrder,
    series_name: line.seriesName,
    material: line.material || null,
    format_label: line.formatLabel || null,
    color_name: line.colorName || null,
    square_meters: line.squareMeters,
    price_per_m2: line.pricePerM2,
    comments: line.comments || null,
    image_url: line.imageUrl || null,
    custom_image_data: line.customImageData || null,
    is_manual: line.isManual,
    crm_series_id: line.crmSeriesId || null,
    crm_format_material_id: line.crmFormatMaterialId || null,
    crm_color_id: line.crmColorId || null,
    series_status: line.seriesStatus || null,
  };
}

export async function listBulkOffers(): Promise<BulkOfferSummary[]> {
  const supabase = await createClient();
  const { data: offers, error } = await supabase
    .from("bulk_offers")
    .select("id,name,created_by,created_at,updated_at,bulk_offer_lines(count)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  return (offers || []).map((o) => {
    const counts = o.bulk_offer_lines as unknown as { count: number }[] | null;
    return {
      id: o.id,
      name: o.name,
      createdBy: o.created_by,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
      lineCount: counts?.[0]?.count ?? 0,
    };
  });
}

export async function getBulkOffer(id: string): Promise<BulkOfferDetail | null> {
  const supabase = await createClient();
  const { data: offer, error } = await supabase
    .from("bulk_offers")
    .select("id,name,created_by,created_at,updated_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!offer) return null;

  const { data: lines, error: linesError } = await supabase
    .from("bulk_offer_lines")
    .select("*")
    .eq("offer_id", id)
    .order("sort_order");
  if (linesError) throw new Error(linesError.message);

  return {
    id: offer.id,
    name: offer.name,
    createdBy: offer.created_by,
    createdAt: offer.created_at,
    updatedAt: offer.updated_at,
    lineCount: (lines || []).length,
    lines: (lines as DbLine[]).map(mapLine),
  };
}

export async function createBulkOffer(input: {
  name: string;
  createdBy: string;
  lines: BulkOfferLineDraft[];
}): Promise<BulkOfferDetail> {
  const supabase = await createClient();
  const { data: offer, error } = await supabase
    .from("bulk_offers")
    .insert({ name: input.name, created_by: input.createdBy })
    .select("id,name,created_by,created_at,updated_at")
    .single();
  if (error) throw new Error(error.message);

  if (input.lines.length) {
    const rows = input.lines.map((line, index) => mapLineToDb(line, offer.id, index));
    const { error: linesError } = await supabase.from("bulk_offer_lines").insert(rows);
    if (linesError) throw new Error(linesError.message);
  }

  const detail = await getBulkOffer(offer.id);
  if (!detail) throw new Error("No se pudo cargar la oferta creada");
  return detail;
}

export async function updateBulkOffer(
  id: string,
  input: { name: string; lines: BulkOfferLineDraft[] },
): Promise<BulkOfferDetail> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("bulk_offers")
    .update({ name: input.name, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  const { error: deleteError } = await supabase.from("bulk_offer_lines").delete().eq("offer_id", id);
  if (deleteError) throw new Error(deleteError.message);

  if (input.lines.length) {
    const rows = input.lines.map((line, index) => mapLineToDb({ ...line, id: line.id || randomUUID() }, id, index));
    const { error: linesError } = await supabase.from("bulk_offer_lines").insert(rows);
    if (linesError) throw new Error(linesError.message);
  }

  const detail = await getBulkOffer(id);
  if (!detail) throw new Error("Oferta no encontrada");
  return detail;
}

export async function deleteBulkOffer(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("bulk_offers").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
