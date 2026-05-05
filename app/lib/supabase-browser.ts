import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";
import { publicSupabaseAnonKey, publicSupabaseUrl } from "./supabase-config";

let browserClient:
  | ReturnType<typeof createSupabaseBrowserClient>
  | undefined;

export function createBrowserClient() {
  if (!browserClient) {
    browserClient = createSupabaseBrowserClient(
      publicSupabaseUrl,
      publicSupabaseAnonKey,
    );
  }

  return browserClient;
}
