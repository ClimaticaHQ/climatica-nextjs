import { stripLocalePrefix } from "@/utils/locale.util";
import { type NextRequest, NextResponse } from "next/server";

/** old links carried the language as a prefix: they redirect without it, and the visitor keeps their own language */
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
