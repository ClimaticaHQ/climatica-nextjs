import { LOCALES } from "@/constants";

export type TLocale = (typeof LOCALES)[number];

export type TResolveRequestLocaleArgs = {
  /** the NEXT_LOCALE cookie's value, if any */
  cookieLocale: string | null | undefined;
  /** the request's Accept-Language header, if any */
  acceptLanguage: string | null | undefined;
};
