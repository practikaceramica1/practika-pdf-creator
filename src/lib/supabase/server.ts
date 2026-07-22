import "server-only";

import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required");
  }
  return { url, anon };
}

/** Authenticated Supabase client (reads/writes with user session + RLS). */
export async function createClient() {
  const { url, anon } = supabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Ignore write errors in server components.
        }
      },
    },
  });
}

/** Anonymous catalog reads (published data only, used by dossier / public APIs). */
export function createCatalogSupabaseClient() {
  const { url, anon } = supabaseEnv();
  return createSupabaseClient(url, anon);
}
