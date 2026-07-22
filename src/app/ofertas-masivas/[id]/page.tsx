import { notFound } from "next/navigation";
import { BulkOffersAppShell } from "@/components/bulk-offers/BulkOffersAppShell";
import { BulkOffersBuilder } from "@/components/bulk-offers/BulkOffersBuilder";
import { requireAdminUser } from "@/lib/auth";
import { getBulkOffer } from "@/lib/bulk-offers-db";

type PageProps = { params: Promise<{ id: string }> };

export default async function BulkOfferEditPage({ params }: PageProps) {
  const user = await requireAdminUser();
  const { id } = await params;
  const offer = await getBulkOffer(id);
  if (!offer) notFound();

  return (
    <BulkOffersAppShell userEmail={user.email || ""}>
      <BulkOffersBuilder initialOffer={offer} />
    </BulkOffersAppShell>
  );
}
