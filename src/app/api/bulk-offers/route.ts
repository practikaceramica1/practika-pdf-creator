import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth";
import { createBulkOffer, listBulkOffers } from "@/lib/bulk-offers-db";
import type { BulkOfferLineDraft } from "@/lib/bulk-offers-types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminUser();
    const offers = await listBulkOffers();
    return NextResponse.json({ offers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAdminUser();
    const body = (await request.json()) as { name?: string; lines?: BulkOfferLineDraft[] };
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "El nombre de la oferta es obligatorio" }, { status: 400 });
    }
    const offer = await createBulkOffer({
      name: body.name.trim(),
      createdBy: user.email || "unknown",
      lines: body.lines || [],
    });
    return NextResponse.json({ offer });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
