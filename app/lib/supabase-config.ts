const defaultSupabaseUrl = "https://kkwfnznsxpvdkvwlfglh.supabase.co";
const defaultSupabaseAnonKey = "sb_publishable_O8hbusSHH5PfcjUKRKpvyA_19YvObOq";

export const publicSupabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? defaultSupabaseUrl;

export const publicSupabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? defaultSupabaseAnonKey;

export const supabaseProjectHost = new URL(publicSupabaseUrl).hostname;
