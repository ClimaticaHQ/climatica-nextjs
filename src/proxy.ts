import { stripLocalePrefix } from "@/utils/locale.util";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Old links carried the language as a prefix (/ro/compare-cities?…): they redirect to the same
 * page and query without it, and the visitor keeps their own language — the cookie is left as it is.
 */
export default function proxy(request: NextRequest) {
  const pathname = stripLocalePrefix(request.nextUrl.pathname);
  if (pathname !== null) {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
