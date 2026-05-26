export const APP_TITLE = "Climatica";

export const APP_CONFIG = {
  i18n: {
    locales: ["en", "uk", "es"] as const,
    defaultLocale: "en",
    localePrefix: "as-needed",
  },
} as const;

export type TLocale = (typeof APP_CONFIG.i18n.locales)[number];
