import { requireAdminUser } from "@/lib/auth";
import { pdfBaseUrl, withAuthenticatedPlaywrightPage } from "@/lib/playwright-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdminUser();
    const base = pdfBaseUrl();
    const url = `${base}/print/ofertas`;

    const { buffer, browser } = await withAuthenticatedPlaywrightPage(request, base, async (page) => {
      await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
      const pdf = await page.pdf({
        width: "320mm",
        height: "180mm",
        printBackground: true,
        preferCSSPageSize: true,
      });
      return Buffer.from(pdf);
    });
    await browser.close();

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="practika-ofertas.pdf"',
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return new Response(
      JSON.stringify({
        error: "No se pudo generar el PDF de ofertas.",
        hint: "Asegurate de tener la app en marcha y Chromium instalado.",
        detail: message,
      }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }
}
