// lib/supabase-server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = "https://kkwfnznsxpvdkvwlfglh.supabase.co";
const supabaseAnonKey = "sb_publishable_O8hbusSHH5PfcjUKRKpvyA_19YvObOq";

export async function createClient() {
    const cookieStore = await cookies()
    return createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    )
                },
            },
        }
    )
}