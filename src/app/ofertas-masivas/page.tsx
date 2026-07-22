import { BulkOffersAppShell } from "@/components/bulk-offers/BulkOffersAppShell";
import { BulkOffersBuilder } from "@/components/bulk-offers/BulkOffersBuilder";
import { requireAdminUser } from "@/lib/auth";

export default async function BulkOffersPage() {
  const user = await requireAdminUser();

  return (
    <BulkOffersAppShell userEmail={user.email || ""}>
      <BulkOffersBuilder />
    </BulkOffersAppShell>
  );
}
