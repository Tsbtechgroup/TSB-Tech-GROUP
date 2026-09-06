import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";

export const supabasePublic = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  },
);