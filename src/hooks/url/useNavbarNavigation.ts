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
 * Navbar links (and the settings link): the store's only reader. The rendered href carries the
 * shared filters alone — the same on the server and the client, and what a new tab opens. A
 * plain click on a page link goes to the page with its remembered params too, built then (never
 * during render) — and, with syncFilters off, with the page's own filters.
 */
export function useNavbarNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const getHref = (route: TPageRoute) => toRouteHref(route, pickSharedFilterParams(searchParams));
  // * the settings page keeps the shared filters in its URL, so the navbar's links from it do too
  const settingsHref = toRouteHref(ROUTES.SETTINGS, pickSharedFilterParams(searchParams));

  function navigate(event: MouseEvent<HTMLAnchorElement>, route: TPageRoute) {
    // * new tab / window, download: the plain href, as any link
    if (!isPlainLinkClick(event)) return;
    event.preventDefault();
    const remembered = useLastPageParamsStore.getState().pages[route];
    const isSyncingFilters = useSettingsStore.getState().syncFilters;
    router.push(buildNavbarHref({ route, current: searchParams, remembered, isSyncingFilters }));
  }

  return { getHref, settingsHref, navigate };
}
