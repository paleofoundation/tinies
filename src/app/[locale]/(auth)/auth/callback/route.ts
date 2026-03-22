import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

/**
 * OAuth callback: exchange code for session and redirect.
 * Session cookies are set on the redirect response so the user is logged in.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard/owner";
  const origin = requestUrl.origin;
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard/owner";
  const welcomeUrl = new URL("/welcome", origin);
  welcomeUrl.searchParams.set("next", safeNext);
  const redirectTo = welcomeUrl;

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
  }

  const response = NextResponse.redirect(redirectTo);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.redirect(`${origin}/login?error=config`);
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
  }

  return response;
}
