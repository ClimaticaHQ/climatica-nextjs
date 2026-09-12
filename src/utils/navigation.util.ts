import type { TAppRouter, TUrlParamHelpers } from "@/types";

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

/** For the createUrlParamHelpers() sync-effect pattern — only navigates when
 * the helper actually changed something, same as every call site did inline. */
export function syncUrlParams(
  router: TAppRouter,
  pathname: string,
  helper: TUrlParamHelpers,
): void {
  if (helper.changed) replaceUrlParams(router, pathname, helper.params);
}
