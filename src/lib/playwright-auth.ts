import "server-only";

import type { Browser, Page } from "playwright";
import { chromium } from "playwright";

function cookiesFromRequest(request: Request, baseUrl: string) {
  const header = request.headers.get("cookie");
  if (!header) return [];

  const { hostname } = new URL(baseUrl);
  return header
    .split(";")
    .map((part) => {
      const eq = part.indexOf("=");
      if (eq <= 0) return null;
      const name = part.slice(0, eq).trim();
      const value = part.slice(eq + 1).trim();
      if (!name) return null;
      return { name, value, domain: hostname, path: "/" };
    })
    .filter(Boolean) as Array<{ name: string; value: string; domain: string; path: string }>;
}

export async function withAuthenticatedPlaywrightPage(
  request: Request,
  baseUrl: string,
  run: (page: Page) => Promise<Buffer>,
): Promise<{ buffer: Buffer; browser: Browser }> {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext();
    const cookies = cookiesFromRequest(request, baseUrl);
    if (cookies.length) await context.addCookies(cookies);
    const page = await context.newPage();
    const buffer = await run(page);
    return { buffer, browser };
  } catch (error) {
    await browser.close();
    throw error;
  }
}

export function pdfBaseUrl(): string {
  return process.env.PDF_BASE_URL?.replace(/\/$/, "") || "http://127.0.0.1:3000";
}
