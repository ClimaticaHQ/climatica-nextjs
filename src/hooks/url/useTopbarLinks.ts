"use client";

import { NAV_LINKS, ROUTES } from "@/constants";
import type { TTopbarHomeLink, TTopbarLink } from "@/types";
import { isRouteActive } from "@/utils/pageParams.util";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useNavbarNavigation } from "./useNavbarNavigation";

/**
 * The navbar's links: the pages (with the shared filters and, on click, their remembered
 * params), About, Settings, and the logo's way home — each marked when it's the current one.
 */
export function useTopbarLinks() {
  const t = useTranslations();
  const pathname = usePathname();
  const { getHref, settingsHref, aboutHref, navigate } = useNavbarNavigation();

  const pages: TTopbarLink[] = [
    ...NAV_LINKS.map(({ to, labelKey }) => ({
      key: to,
      href: getHref(to),
      label: t(labelKey),
      isActive: isRouteActive(pathname, to),
      onNavigate: (event: Parameters<typeof navigate>[0]) => navigate(event, to),
    })),
    {
      key: ROUTES.ABOUT,
      href: aboutHref,
      label: t("navbar.about"),
      isActive: isRouteActive(pathname, ROUTES.ABOUT),
    },
  ];
  const settings: TTopbarLink = {
    key: ROUTES.SETTINGS,
    href: settingsHref,
    label: t("navbar.settings"),
    isActive: pathname === ROUTES.SETTINGS,
  };
  // * the home page is City Climate ("/" redirects there, dropping the query) — so the logo goes
  // * the navbar's way: shared filters, plus City Climate's remembered params
  const home: TTopbarHomeLink = {
    href: getHref(ROUTES.CLIMATE_STATISTICS),
    onNavigate: (event) => navigate(event, ROUTES.CLIMATE_STATISTICS),
  };

  return { pages, settings, home };
}
