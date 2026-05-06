import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

export const supabase = (env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
      },
    })
  : null;

if (!supabase) {
  console.warn("⚠️ Supabase credentials missing. Storage features will be disabled.");
}
