import "server-only";

import type { BulkOfferLineDraft } from "@/lib/bulk-offers-types";
import { createClient } from "@/lib/supabase/server";

function canonicalFormatKey(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s/g, "")
    .replace(/×/g, "x")
    .replace(/,/g, ".")
    .replace(/cm/g, "");
}

export function practikaWebBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_PRACTIKA_WEB_URL || "https://practikaceramica.com").replace(/\/$/, "");
}

export function buildProductWebUrl(input: {
  seriesSlug: string;
  formatLabel: string;
  colorId?: string;
}): string {
  const slug = input.seriesSlug.trim();
  const format = canonicalFormatKey(input.formatLabel);
  if (!slug || !format) return "";

  const params = new URLSearchParams({ formato: format });
  const colorId = input.colorId?.trim();
  if (colorId) params.set("colorId", colorId);

  return `${practikaWebBaseUrl()}/productos/${encodeURIComponent(slug)}?${params.toString()}`;
}

export async function resolveSeriesSlugsForLines(
  lines: BulkOfferLineDraft[],
): Promise<Map<string, string>> {
  const ids = [
    ...new Set(lines.map((line) => line.crmSeriesId).filter((id): id is string => Boolean(id))),
  ];
  if (!ids.length) return new Map();

  const supabase = await createClient();
  const { data, error } = await supabase.from("series").select("id,slug").in("id", ids);
  if (error) throw new Error(error.message);

  return new Map((data || []).map((row) => [row.id, row.slug]));
}

export function lineProductWebUrl(
  line: BulkOfferLineDraft,
  slugBySeriesId: Map<string, string>,
): string {
  if (!line.crmColorId || !line.formatLabel) return "";

  const seriesSlug =
    line.seriesSlug?.trim() ||
    (line.crmSeriesId ? slugBySeriesId.get(line.crmSeriesId) : "") ||
    "";

  if (!seriesSlug) return "";

  return buildProductWebUrl({
    seriesSlug,
    formatLabel: line.formatLabel,
    colorId: line.crmColorId,
  });
}
