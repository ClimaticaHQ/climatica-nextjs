"use client";

import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants";
import { useLastPageParamsStore, useSettingsStore } from "@/stores";
import type { TPageRoute } from "@/types";
import { isPlainLinkClick } from "@/utils/urlStateGuard.util";
import { buildNavbarHref, pickSharedFilterParams, toRouteHref } from "@/utils/pageParams.util";
import { useSearchParams } from "next/navigation";
import { useState, useTransition, type MouseEvent } from "react";

/**
 * Navbar links (and the settings and Info links): the store's only reader. The rendered href carries the
 * shared filters alone — the same on the server and the client, and what a new tab opens. A
 * plain click on a page link goes to the page with its remembered params too, built then (never
 * during render) — and, with syncFilters off, with the page's own filters. The route a click is
 * opening is `pendingRoute` until its page has arrived; null again if the navigation is dropped.
 */
export function useNavbarNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [openingRoute, setOpeningRoute] = useState<string | null>(null);

  function open(route: string, href: string) {
    setOpeningRoute(route);
    startTransition(() => router.push(href));
  }

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
    open(route, buildNavbarHref({ route, current: searchParams, remembered, isSyncingFilters }));
  }

  // * a page without filters (settings, Info): its plain href, tracked as opening too
  function navigatePlain(event: MouseEvent<HTMLAnchorElement>, route: string) {
    if (!isPlainLinkClick(event)) return;
    event.preventDefault();
    open(route, getPlainHref(route));
  }

  // * an Info page from the Info contents sheet, once the sheet has closed
  const pushHref = (href: string) => router.push(href);

  return {
    getHref,
    getPlainHref,
    settingsHref,
    aboutHref,
    navigate,
    navigatePlain,
    pushHref,
    pendingRoute: isPending ? openingRoute : null,
  };
}
