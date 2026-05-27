import { APP_CONFIG } from "@/constants/app.constant";
import type { TLocale } from "@/constants/app.constant";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: APP_CONFIG.i18n.locales,
  defaultLocale: APP_CONFIG.i18n.defaultLocale,
  localePrefix: APP_CONFIG.i18n.localePrefix,
});

export function parseLocale(value: string | undefined): TLocale {
  const known: readonly string[] = routing.locales;
  return known.includes(value ?? "") ? (value as TLocale) : routing.defaultLocale;
}
