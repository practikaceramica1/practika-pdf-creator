import { NextResponse } from "next/server";
import { fetchCrmSeriesBySlug, fetchCrmSeriesList } from "@/lib/crm-series";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (slug) {
      const series = await fetchCrmSeriesBySlug(slug);
      if (!series) {
        return NextResponse.json({ error: "Serie no encontrada" }, { status: 404 });
      }
      return NextResponse.json({ series });
    }

    const series = await fetchCrmSeriesList();
    return NextResponse.json({ series });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
