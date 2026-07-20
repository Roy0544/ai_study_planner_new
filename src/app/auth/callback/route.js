import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

/**
 * Route Handler: /auth/callback
 *
 * Supabase PKCE OAuth redirects here with ?code=... after Google login.
 * This handler exchanges the code for a session (setting cookies server-side),
 * then redirects the user to the intended destination.
 */
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Session is now in cookies - redirect to destination
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error("[auth/callback] Code exchange error:", error.message);
  }

  // Something went wrong - redirect to login with error hint
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
