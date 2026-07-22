import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Usuario autenticado en Supabase (mismas cuentas que el CRM). */
export async function requireAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) redirect("/login");
  return user;
}
