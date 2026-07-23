import { requireAdminUser } from "@/lib/auth";
import { getBulkOffer } from "@/lib/bulk-offers-db";
import { pdfContentDisposition, resolveBulkOfferForExport } from "@/lib/bulk-offer-export-response";
import { buildBulkOfferPdf } from "@/lib/export-bulk-offer-pdf";
import { sanitizeFilename } from "@/lib/export-bulk-offer-shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    await requireAdminUser();
    const { id } = await context.params;
    const offer = await getBulkOffer(id);
    if (!offer) return new Response(JSON.stringify({ error: "Oferta no encontrada" }), { status: 404 });

    const exportOffer = resolveBulkOfferForExport(request, offer);
    const buffer = await buildBulkOfferPdf(exportOffer);
    const filename = `${sanitizeFilename(offer.name)}.pdf`;

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": pdfContentDisposition(request, filename),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({
        error: "No se pudo generar el PDF.",
        detail: message,
      }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }
}
