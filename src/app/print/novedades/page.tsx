import { NovedadesPrintDocument } from "@/components/catalog/NovedadesPrintDocument";
import { sampleNovedadesCatalog } from "@/data/novedades-sample";

export default function NovedadesPrintPage() {
  return <NovedadesPrintDocument catalog={sampleNovedadesCatalog} />;
}
