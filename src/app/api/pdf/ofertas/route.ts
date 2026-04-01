import { chromium } from "playwright";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const base = process.env.PDF_BASE_URL?.replace(/\/$/, "") || "http://127.0.0.1:3000";
  const url = `${base}/print/ofertas`;

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
    const pdf = await page.pdf({
      width: "320mm",
      height: "180mm",
      printBackground: true,
      preferCSSPageSize: true,
    });

    return new Response(Buffer.from(pdf), {
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
  } finally {
    await browser?.close();
  }
}
