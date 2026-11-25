"use client";

import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants";
import { useLastPageParamsStore, useSettingsStore } from "@/stores";
import type { TPageRoute } from "@/types";
import { isPlainLinkClick } from "@/utils/urlStateGuard.util";
import { buildNavbarHref, pickSharedFilterParams, toRouteHref } from "@/utils/pageParams.util";
import { useSearchParams } from "next/navigation";
import { useState, useTransition, type MouseEvent } from "react";

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
  const getPlainHref = (route: string) => toRouteHref(route, pickSharedFilterParams(searchParams));
  const settingsHref = getPlainHref(ROUTES.SETTINGS);
  const aboutHref = getPlainHref(ROUTES.ABOUT);

  function navigate(event: MouseEvent<HTMLAnchorElement>, route: TPageRoute) {
    if (!isPlainLinkClick(event)) return;
    event.preventDefault();
    const remembered = useLastPageParamsStore.getState().pages[route];
    const isSyncingFilters = useSettingsStore.getState().syncFilters;
    open(route, buildNavbarHref({ route, current: searchParams, remembered, isSyncingFilters }));
  }

  function navigatePlain(event: MouseEvent<HTMLAnchorElement>, route: string) {
    if (!isPlainLinkClick(event)) return;
    event.preventDefault();
    open(route, getPlainHref(route));
  }

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
