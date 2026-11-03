"use client";

import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants";
import { useLastPageParamsStore, useSettingsStore } from "@/stores";
import type { TPageRoute } from "@/types";
import { isPlainLinkClick } from "@/utils/urlStateGuard.util";
import { buildNavbarHref, pickSharedFilterParams, toRouteHref } from "@/utils/pageParams.util";
import { useSearchParams } from "next/navigation";
import type { MouseEvent } from "react";

/**
 * Navbar links (and the settings and Info links): the store's only reader. The rendered href carries the
 * shared filters alone — the same on the server and the client, and what a new tab opens. A
 * plain click on a page link goes to the page with its remembered params too, built then (never
 * during render) — and, with syncFilters off, with the page's own filters.
 */
export function useNavbarNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const getHref = (route: TPageRoute) => toRouteHref(route, pickSharedFilterParams(searchParams));
  // * pages without filters (settings, Info) keep the shared filters in their URL, so the
  // * navbar's links from them do too
  const getPlainHref = (route: string) => toRouteHref(route, pickSharedFilterParams(searchParams));
  const settingsHref = getPlainHref(ROUTES.SETTINGS);
  const aboutHref = getPlainHref(ROUTES.ABOUT);

  function navigate(event: MouseEvent<HTMLAnchorElement>, route: TPageRoute) {
    // * new tab / window, download: the plain href, as any link
    if (!isPlainLinkClick(event)) return;
    event.preventDefault();
    const remembered = useLastPageParamsStore.getState().pages[route];
    const isSyncingFilters = useSettingsStore.getState().syncFilters;
    router.push(buildNavbarHref({ route, current: searchParams, remembered, isSyncingFilters }));
  }

  // * an Info page from the Info contents sheet, once the sheet has closed
  const pushHref = (href: string) => router.push(href);

  return { getHref, getPlainHref, settingsHref, aboutHref, navigate, pushHref };
}
