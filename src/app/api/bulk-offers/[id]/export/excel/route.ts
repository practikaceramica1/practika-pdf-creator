import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth";
import { getBulkOffer } from "@/lib/bulk-offers-db";
import { resolveBulkOfferForExport } from "@/lib/bulk-offer-export-response";
import { buildBulkOfferExcel, sanitizeFilename } from "@/lib/export-bulk-offer-excel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    await requireAdminUser();
    const { id } = await context.params;
    const offer = await getBulkOffer(id);
    if (!offer) return NextResponse.json({ error: "Oferta no encontrada" }, { status: 404 });

    const exportOffer = resolveBulkOfferForExport(request, offer);
    const buffer = await buildBulkOfferExcel(exportOffer);
    const filename = `${sanitizeFilename(offer.name)}.xlsx`;

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
