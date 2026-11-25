import { LOCALES } from "@/constants";

export type TLocale = (typeof LOCALES)[number];

export type TResolveRequestLocaleArgs = {
  cookieLocale: string | null | undefined;
  acceptLanguage: string | null | undefined;
};
