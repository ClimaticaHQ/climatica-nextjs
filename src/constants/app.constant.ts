export const APP_TITLE = "Climatica";

export const APP_CONFIG = {
  i18n: {
    locales: ["de", "el", "en", "es", "fr", "it", "pt", "uk"] as const,
    defaultLocale: "en",
    localePrefix: "as-needed",
  },
} as const;

export type TLocale = (typeof APP_CONFIG.i18n.locales)[number];
