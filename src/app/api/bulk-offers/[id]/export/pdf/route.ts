import { chromium } from "playwright";
import { requireAdminUser } from "@/lib/auth";
import { getBulkOffer } from "@/lib/bulk-offers-db";
import { formatOfferSummaryForPdf, sanitizeFilename } from "@/lib/export-bulk-offer-excel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildPrintHtml(offer: NonNullable<Awaited<ReturnType<typeof getBulkOffer>>>) {
  const lines = formatOfferSummaryForPdf(offer);
  const grandTotal = lines.reduce((sum, line) => {
    const n = Number(line.total.replace(/\./g, "").replace(",", "."));
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);

  const rows = lines
    .map(
      (line, index) => `
      <tr style="background:${index % 2 === 0 ? "#f8faff" : "#ffffff"}">
        <td style="border:1px solid #e5e7eb;padding:8px;vertical-align:middle;">
          ${
            line.image
              ? `<img src="${escapeHtml(line.image)}" alt="" style="width:64px;height:64px;object-fit:cover;border-radius:6px;" />`
              : `<div style="width:64px;height:64px;border:1px dashed #d1d5db;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#9ca3af;">Sin foto</div>`
          }
        </td>
        <td style="border:1px solid #e5e7eb;padding:8px;font-weight:600;">${escapeHtml(line.series)}</td>
        <td style="border:1px solid #e5e7eb;padding:8px;">${escapeHtml(line.material)}</td>
        <td style="border:1px solid #e5e7eb;padding:8px;">${escapeHtml(line.format)}</td>
        <td style="border:1px solid #e5e7eb;padding:8px;">${escapeHtml(line.color)}</td>
        <td style="border:1px solid #e5e7eb;padding:8px;text-align:right;">${escapeHtml(line.squareMeters)}</td>
        <td style="border:1px solid #e5e7eb;padding:8px;text-align:right;">${escapeHtml(line.pricePerM2)}</td>
        <td style="border:1px solid #e5e7eb;padding:8px;text-align:right;font-weight:600;">${escapeHtml(line.total)}</td>
        <td style="border:1px solid #e5e7eb;padding:8px;">${escapeHtml(line.comments)}</td>
      </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <style>
    @page { size: A4 landscape; margin: 12mm 10mm; }
    body { font-family: Arial, sans-serif; color: #1a1f3d; margin: 0; }
    h1 { margin: 8px 0 0; font-size: 28px; }
    .meta { color: #666; font-size: 12px; margin-top: 8px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 24px; }
    th { background: #1a1f3d; color: white; border: 1px solid #1a1f3d; padding: 8px; text-align: left; }
    .total { margin-top: 24px; text-align: right; }
    .total-box { display: inline-block; background: #f59e0b; padding: 12px 16px; font-weight: 700; border-radius: 8px; }
    footer { margin-top: 32px; font-size: 11px; color: #888; }
  </style>
</head>
<body>
  <p style="font-size:12px;letter-spacing:0.25em;text-transform:uppercase;color:#2a3156;">Practika cerámica</p>
  <h1>${escapeHtml(offer.name)}</h1>
  <p class="meta">${escapeHtml(
    new Date(offer.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" }),
  )}</p>
  <table>
    <thead>
      <tr>
        <th>Imagen</th><th>Serie</th><th>Material</th><th>Formato</th><th>Color</th>
        <th style="text-align:right;">m²</th><th style="text-align:right;">€/m²</th><th style="text-align:right;">Total</th><th>Comentarios</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="total"><div class="total-box">TOTAL: ${grandTotal.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</div></div>
  <footer>practikaceramica.com</footer>
</body>
</html>`;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAdminUser();
    const { id } = await context.params;
    const offer = await getBulkOffer(id);
    if (!offer) return new Response(JSON.stringify({ error: "Oferta no encontrada" }), { status: 404 });

    let browser;
    try {
      browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      await page.setContent(buildPrintHtml(offer), { waitUntil: "networkidle", timeout: 90_000 });
      const pdf = await page.pdf({
        format: "A4",
        landscape: true,
        printBackground: true,
        margin: { top: "12mm", right: "10mm", bottom: "12mm", left: "10mm" },
      });

      const filename = `${sanitizeFilename(offer.name)}.pdf`;
      return new Response(Buffer.from(pdf), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    } finally {
      await browser?.close();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({
        error: "No se pudo generar el PDF.",
        hint: "Asegúrate de tener la app en marcha y Chromium instalado.",
        detail: message,
      }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }
}
