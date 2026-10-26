import { DEFAULT_LOCALE, LOCALE_ALIASES, LOCALES } from "@/constants";
import type { TLocale, TResolveRequestLocaleArgs } from "@/types";

export function isSupportedLocale(value: string | null | undefined): value is TLocale {
  return LOCALES.some((locale) => locale === value);
}

/** A supported locale, or the default for anything else. */
export function parseLocale(value: string | null | undefined): TLocale {
  return isSupportedLocale(value) ? value : DEFAULT_LOCALE;
}

/**
 * The browser's most preferred supported language from an Accept-Language header: tags by
 * their q weight (ties keep their order), each matched by its language part ("pt-BR" → pt).
 */
export function matchAcceptLanguage(header: string | null | undefined): TLocale | null {
  if (!header) return null;
  const tags = header
    .split(",")
    .map((part, index) => {
      const [tag = "", ...params] = part.trim().split(";");
      const quality = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      return { tag: tag.toLowerCase(), q: quality ? Number(quality.slice(2)) : 1, index };
    })
    .filter(({ tag, q }) => tag !== "" && tag !== "*" && q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index);
  for (const { tag } of tags) {
    const language = tag.split("-")[0] ?? "";
    const candidate = LOCALE_ALIASES[language] ?? language;
    if (isSupportedLocale(candidate)) return candidate;
  }
  return null;
}

/** The request's language: the visitor's cookie, else the browser's, else the default. */
export function resolveRequestLocale({ cookieLocale, acceptLanguage }: TResolveRequestLocaleArgs) {
  if (isSupportedLocale(cookieLocale)) return cookieLocale;
  return matchAcceptLanguage(acceptLanguage) ?? DEFAULT_LOCALE;
}

/**
 * The same path without a leading locale segment ("/ro/compare-cities" → "/compare-cities"),
 * or null when it has none — an old link to redirect.
 */
export function stripLocalePrefix(pathname: string): string | null {
  const [, first, ...rest] = pathname.split("/");
  if (!isSupportedLocale(first)) return null;
  return `/${rest.join("/")}`;
}
