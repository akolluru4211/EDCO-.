import { createClient as createBrowserSupabaseClient } from "./supabase/client";

// Export standard singleton browser client for client components
export const supabase = createBrowserSupabaseClient();
export default supabase;
