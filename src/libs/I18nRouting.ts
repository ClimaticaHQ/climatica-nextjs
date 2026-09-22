import { APP_CONFIG, LOCALES } from "@/constants";
import type { TLocale } from "@/types";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: APP_CONFIG.i18n.defaultLocale,
  localePrefix: APP_CONFIG.i18n.localePrefix,
});

export function parseLocale(value: string | undefined): TLocale {
  const known: readonly string[] = routing.locales;
  return known.includes(value ?? "") ? (value as TLocale) : routing.defaultLocale;
}
