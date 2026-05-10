"use server";

import { auth } from "@/lib/supabase/server-auth";

export async function getCurrentSession() {
  return await auth();
}
