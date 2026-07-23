import { notFound } from "next/navigation";
import { BulkOfferPrintDocument } from "@/components/bulk-offers/BulkOfferPrintDocument";
import { getBulkOffer } from "@/lib/bulk-offers-db";
import { formatOfferSummaryForPdf } from "@/lib/export-bulk-offer-excel";
import "./print.css";

export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<{ offerId?: string }> };

export default async function BulkOfferPrintPage({ searchParams }: PageProps) {
  const { offerId } = await searchParams;
  if (!offerId) notFound();

  const offer = await getBulkOffer(offerId);
  if (!offer) notFound();

  const lines = await formatOfferSummaryForPdf(offer);

  return (
    <BulkOfferPrintDocument title={offer.name} createdAt={offer.createdAt} lines={lines} />
  );
}
