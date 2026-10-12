import type { TAppRouter } from "@/types";

/**
 * Filter/sidebar-driven URL updates must never move the viewport — Next.js
 * scrolls to top by default on push/replace unless told not to.
 */
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
