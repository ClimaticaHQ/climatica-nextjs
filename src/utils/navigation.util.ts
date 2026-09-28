import { useNavigationIntentStore } from "@/stores/navigationIntentStore";
import type { TAppRouter, TNavigateWithIntentArgs } from "@/types";
import { buildLocalePathname } from "./export/shared/shareUrl.util";

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

/**
 * The one way to navigate to another route (or locale) from code: records the navigation
 * intent first — as NavigationIntentTracker does for link clicks — so a pending URL-state
 * write on the page being left can't cancel it.
 */
export function navigateWithIntent({ router, pathname, query, locale }: TNavigateWithIntentArgs) {
  useNavigationIntentStore.getState().setPendingPathname(buildLocalePathname(locale, pathname));
  router.push({ pathname, query }, { locale, scroll: false });
}
