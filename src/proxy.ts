import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { updateSession } from "@/lib/supabase/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

/**
 * Strip known locale prefix so auth checks use the logical app path.
 * Only the first segment is treated as a locale (en|el|ru). Paths like /adopt/splotch
 * are unchanged here — "splotch" is never interpreted as a locale (that would require /splotch/...).
 */
function pathnameWithoutLocale(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  if (first === "en" || first === "el" || first === "ru") {
    const rest = segments.slice(1).join("/");
    return rest ? `/${rest}` : "/";
  }
  return pathname;
}

/**
 * Next.js 16+ uses `proxy.ts` (formerly `middleware.ts`) for request interception.
 * next-intl must run here so unprefixed English URLs rewrite to `[locale]` (e.g. /adopt → /en/adopt).
 */
export async function proxy(request: NextRequest) {
  const intlResponse = intlMiddleware(request);
  const { response, user } = await updateSession(request, intlResponse);

  const path = request.nextUrl.pathname;
  const pathForAuth = pathnameWithoutLocale(path);
  if (
    (pathForAuth === "/dashboard" || pathForAuth.startsWith("/dashboard/")) &&
    !user
  ) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  // Exclude paths with a dot (static files). Also exclude root metadata routes:
  // they live in app/ (not under [locale]) and must not be rewritten to /en/...
  matcher: [
    "/((?!api|_next|_vercel|icon$|apple-icon$|opengraph-image$|.*\\..*).*)",
  ],
};
