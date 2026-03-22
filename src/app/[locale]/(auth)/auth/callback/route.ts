import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { upsertPrismaUserFromSupabaseAuthUser } from "@/lib/auth/upsert-prisma-user";
import { dashboardPathForRole } from "@/lib/giving/signup-donation-helpers";

/**
 * OAuth callback: exchange code for session and redirect.
 * Session cookies are set on the redirect response so the user is logged in.
 * New users (or anyone who has not finished /welcome) go to /welcome; others go to `next`.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard/owner";
  const origin = requestUrl.origin;
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard/owner";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.redirect(`${origin}/login?error=config`);
  }

  const welcomeUrl = new URL("/welcome", origin);
  welcomeUrl.searchParams.set("next", safeNext);

  const response = NextResponse.redirect(welcomeUrl);

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await upsertPrismaUserFromSupabaseAuthUser(user);
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { welcomeFlowCompletedAt: true, role: true },
    });
    if (dbUser?.welcomeFlowCompletedAt) {
      const target =
        safeNext === "/welcome" || safeNext.startsWith("/welcome?")
          ? dashboardPathForRole(dbUser.role)
          : safeNext;
      response.headers.set("Location", new URL(target, origin).toString());
    }
  }

  return response;
}
