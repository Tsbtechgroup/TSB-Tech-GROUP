import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "Configuration Supabase manquante : vérifie VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY."
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);