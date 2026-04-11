import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://kkwfnznsxpvdkvwlfglh.supabase.co";
const supabaseAnonKey = "sb_publishable_O8hbusSHH5PfcjUKRKpvyA_19YvObOq";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);