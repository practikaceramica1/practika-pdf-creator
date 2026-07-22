import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth";
import { deleteBulkOffer, getBulkOffer, updateBulkOffer } from "@/lib/bulk-offers-db";
import type { BulkOfferLineDraft } from "@/lib/bulk-offers-types";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAdminUser();
    const { id } = await context.params;
    const offer = await getBulkOffer(id);
    if (!offer) return NextResponse.json({ error: "Oferta no encontrada" }, { status: 404 });
    return NextResponse.json({ offer });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    await requireAdminUser();
    const { id } = await context.params;
    const body = (await request.json()) as { name?: string; lines?: BulkOfferLineDraft[] };
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "El nombre de la oferta es obligatorio" }, { status: 400 });
    }
    const offer = await updateBulkOffer(id, { name: body.name.trim(), lines: body.lines || [] });
    return NextResponse.json({ offer });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdminUser();
    const { id } = await context.params;
    await deleteBulkOffer(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
