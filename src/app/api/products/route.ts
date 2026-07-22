import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth";
import { fetchBulkOfferMaterials, fetchBulkOfferProductRows } from "@/lib/crm-products";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminUser();
    const [rows, materials] = await Promise.all([fetchBulkOfferProductRows(), fetchBulkOfferMaterials()]);
    return NextResponse.json({ rows, materials });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
