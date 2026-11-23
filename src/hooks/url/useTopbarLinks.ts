"use client";

import { NAV_LINKS, ROUTES } from "@/constants";
import type { TTopbarHomeLink, TTopbarLink } from "@/types";
import { isRouteActive } from "@/utils/pageParams.util";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useNavbarNavigation } from "./useNavbarNavigation";

/**
 * The navbar's links: the pages (with the shared filters and, on click, their remembered
 * params), About, Settings, and the logo's way home — each marked when it's the current one,
 * and highlighted when it's the one being opened (or, with none, the current one).
 */
export function useTopbarLinks() {
  const t = useTranslations();
  const pathname = usePathname();
  const { getHref, settingsHref, aboutHref, navigate, navigatePlain, pendingRoute } =
    useNavbarNavigation();
  const isHighlighted = (route: string, isActive: boolean) =>
    pendingRoute === null ? isActive : pendingRoute === route;

  const pages: TTopbarLink[] = [
    ...NAV_LINKS.map(({ to, labelKey }) => {
      const isActive = isRouteActive(pathname, to);
      return {
        key: to,
        href: getHref(to),
        label: t(labelKey),
        isActive,
        isHighlighted: isHighlighted(to, isActive),
        onNavigate: (event: Parameters<typeof navigate>[0]) => navigate(event, to),
      };
    }),
    {
      key: ROUTES.ABOUT,
      href: aboutHref,
      label: t("navbar.about"),
      isActive: isRouteActive(pathname, ROUTES.ABOUT),
      isHighlighted: isHighlighted(ROUTES.ABOUT, isRouteActive(pathname, ROUTES.ABOUT)),
      onNavigate: (event) => navigatePlain(event, ROUTES.ABOUT),
    },
  ];
  const isSettingsActive = pathname === ROUTES.SETTINGS;
  const settings: TTopbarLink = {
    key: ROUTES.SETTINGS,
    href: settingsHref,
    label: t("navbar.settings"),
    isActive: isSettingsActive,
    isHighlighted: isHighlighted(ROUTES.SETTINGS, isSettingsActive),
    onNavigate: (event) => navigatePlain(event, ROUTES.SETTINGS),
  };
  // * the home page is City Climate ("/" redirects there, dropping the query) — so the logo goes
  // * the navbar's way: shared filters, plus City Climate's remembered params
  const home: TTopbarHomeLink = {
    href: getHref(ROUTES.CLIMATE_STATISTICS),
    onNavigate: (event) => navigate(event, ROUTES.CLIMATE_STATISTICS),
  };

  return { pages, settings, home };
}
