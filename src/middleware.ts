import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { updateSession } from "@/lib/supabase/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

function pathnameWithoutLocale(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  if (first === "el" || first === "ru") {
    const rest = segments.slice(1).join("/");
    return rest ? `/${rest}` : "/";
  }
  return pathname;
}

export async function middleware(request: NextRequest) {
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
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
