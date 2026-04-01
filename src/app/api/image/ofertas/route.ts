import { chromium } from "playwright";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const urlObj = new URL(request.url);
  const pageParam = urlObj.searchParams.get("page");
  const page = pageParam ? Math.max(Number.parseInt(pageParam, 10) || 1, 1) : 1;

  const base = process.env.PDF_BASE_URL?.replace(/\/$/, "") || "http://127.0.0.1:3000";
  const url = `${base}/print/ofertas?page=${page}`;

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const preview = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    await preview.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
    const image = await preview.screenshot({ type: "png", fullPage: false });

    return new Response(Buffer.from(image), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="practika-oferta-p${page}.png"`,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return new Response(
      JSON.stringify({
        error: "No se pudo generar la imagen de oferta.",
        hint: "Asegurate de tener la app en marcha y Chromium instalado.",
        detail: message,
      }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  } finally {
    await browser?.close();
  }
}
