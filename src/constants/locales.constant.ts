import locales from "@/configs/locales.json";
import { TIME } from "./time.constant";

export const LOCALES = locales;

export const DEFAULT_LOCALE = "en";

// * next-intl's cookie name, kept so choices made before the URL lost its prefix carry over
export const LOCALE_COOKIE = {
  NAME: "NEXT_LOCALE",
  MAX_AGE_SECONDS: TIME.IN_SECONDS.DAY * 365,
  PATH: "/",
  SAME_SITE: "lax",
} as const;

export const LOCALE_ALIASES: Readonly<Record<string, string>> = { no: "nb", nn: "nb" };
