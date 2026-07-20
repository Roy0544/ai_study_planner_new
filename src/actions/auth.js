"use server";

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase-server";

/**
 * Server Action: Email/Password Login
 * Authenticates via Supabase and sets session cookies server-side
 * before redirecting, so the dashboard page always sees the session.
 */
export async function loginWithEmail(email, password) {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Session is now stored in cookies by the server client.
  // Redirect to dashboard.
  redirect("/dashboard");
}
