import { APP_CONFIG } from "@/constants";
import type { TLocale } from "@/types";

/** Mirrors next-intl's "as-needed" locale strategy without its navigation module, which needs a real Next.js runtime unlike this file. */
export function buildLocalePathname(locale: TLocale, route: string): string {
  const isUnprefixedDefault =
    APP_CONFIG.i18n.localePrefix === "as-needed" && locale === APP_CONFIG.i18n.defaultLocale;
  return isUnprefixedDefault ? route : `/${locale}${route}`;
}
