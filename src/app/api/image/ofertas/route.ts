import { requireAdminUser } from "@/lib/auth";
import { pdfBaseUrl, withAuthenticatedPlaywrightPage } from "@/lib/playwright-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdminUser();
    const urlObj = new URL(request.url);
    const pageParam = urlObj.searchParams.get("page");
    const pageNumber = pageParam ? Math.max(Number.parseInt(pageParam, 10) || 1, 1) : 1;

    const base = pdfBaseUrl();
    const url = `${base}/print/ofertas?page=${pageNumber}`;

    const { buffer, browser } = await withAuthenticatedPlaywrightPage(request, base, async (page) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
      const image = await page.screenshot({ type: "png", fullPage: false });
      return Buffer.from(image);
    });
    await browser.close();

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="practika-oferta-p${pageNumber}.png"`,
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
  }
}
