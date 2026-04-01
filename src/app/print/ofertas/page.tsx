import { OffersPrintDocument } from "@/components/offers/OffersPrintDocument";
import { sampleOffersCatalog } from "@/data/ofertas-sample";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function OfertasPrintPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const pageParam = params.page;
  const rawPage = Array.isArray(pageParam) ? pageParam[0] : pageParam;
  const parsed = rawPage ? Number.parseInt(rawPage, 10) : Number.NaN;
  const onlyPageIndex = Number.isNaN(parsed) ? undefined : Math.max(parsed - 1, 0);

  return (
    <OffersPrintDocument catalog={sampleOffersCatalog} onlyPageIndex={onlyPageIndex} />
  );
}
