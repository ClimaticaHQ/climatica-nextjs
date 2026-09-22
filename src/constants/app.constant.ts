import { LOCALES } from "./locales.constant";

export const APP_TITLE = "Climatica";

export const APP_CONFIG = {
  i18n: {
    locales: LOCALES,
    defaultLocale: "en",
    localePrefix: "as-needed",
  },
} as const;
