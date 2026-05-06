// lib/supabase-server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicSupabaseAnonKey, publicSupabaseUrl } from "./supabase-config";

export async function createClient() {
    const cookieStore = await cookies();
    return createServerClient(
        publicSupabaseUrl,
        publicSupabaseAnonKey,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // Server Component renders cannot write cookies.
                        // Session refresh for render-time routes must happen in proxy.ts.
                    }
                },
            },
        }
    )
}
