import type { TAppRouter } from "@/types";

/** Next.js scrolls to top on push/replace unless told not to */
export function replaceUrlParams(
  router: TAppRouter,
  pathname: string,
  params: URLSearchParams,
): void {
  router.replace(`${pathname}?${params.toString()}`, { scroll: false });
}

export function pushUrlParams(router: TAppRouter, pathname: string, params: URLSearchParams): void {
  router.push(`${pathname}?${params.toString()}`, { scroll: false });
}
