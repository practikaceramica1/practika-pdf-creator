import { BulkOffersAppShell } from "@/components/bulk-offers/BulkOffersAppShell";
import { SavedOffersTable } from "@/components/bulk-offers/SavedOffersTable";
import { requireAdminUser } from "@/lib/auth";

export default async function BulkOffersHistoryPage() {
  const user = await requireAdminUser();

  return (
    <BulkOffersAppShell userEmail={user.email || ""}>
      <SavedOffersTable />
    </BulkOffersAppShell>
  );
}
