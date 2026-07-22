import { requireAdminUser } from "@/lib/auth";
import { pdfBaseUrl, withAuthenticatedPlaywrightPage } from "@/lib/playwright-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Genera el PDF visitando la ruta de impresión.
 * Requiere sesión iniciada (misma cookie que el navegador).
 */
export async function GET(request: Request) {
  try {
    await requireAdminUser();
    const base = pdfBaseUrl();
    const url = `${base}/print/novedades`;

    const { buffer, browser } = await withAuthenticatedPlaywrightPage(request, base, async (page) => {
      await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
      });
      return Buffer.from(pdf);
    });
    await browser.close();

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="practika-novedades.pdf"',
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return new Response(
      JSON.stringify({
        error: "No se pudo generar el PDF.",
        hint: "Asegúrate de que la app está en marcha y de haber ejecutado `npx playwright install chromium`.",
        detail: message,
        url: `${pdfBaseUrl()}/print/novedades`,
      }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }
}
