import { chromium } from "playwright";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Genera el PDF visitando la ruta de impresión.
 * Arranca la app (`npm run dev` o `npm start`) y llama:
 * GET /api/pdf/novedades
 *
 * Opcional: PDF_BASE_URL=http://127.0.0.1:3000
 */
export async function GET() {
  const base =
    process.env.PDF_BASE_URL?.replace(/\/$/, "") || "http://127.0.0.1:3000";
  const url = `${base}/print/novedades`;

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });
    return new Response(Buffer.from(pdf), {
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
        url,
      }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  } finally {
    await browser?.close();
  }
}
