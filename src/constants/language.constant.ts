import { TLocale } from "@/types";
import { LOCALES } from "./locales.constant";

const LANGUAGE_METADATA: Record<TLocale, { label: string; flag: string }> = {
  de: { label: "DE", flag: "🇩🇪" },
  el: { label: "EL", flag: "🇬🇷" },
  en: { label: "EN", flag: "🇬🇧" },
  es: { label: "ES", flag: "🇪🇸" },
  fr: { label: "FR", flag: "🇫🇷" },
  it: { label: "IT", flag: "🇮🇹" },
  nb: { label: "NB", flag: "🇳🇴" },
  pt: { label: "PT", flag: "🇵🇹" },
  ro: { label: "RO", flag: "🇷🇴" },
  uk: { label: "UA", flag: "🇺🇦" },
};

export const LANGUAGES = LOCALES.map((code) => {
  const meta = LANGUAGE_METADATA[code as TLocale];

  return {
    code,
    label: meta ? `${meta.label} ${meta.flag}` : code.toUpperCase(),
  };
});

export const DEFAULT_LANGUAGE: TLocale = "en";

export const SUPPORTED_LANGUAGE_CODES = new Set<string>(LOCALES);

export const LANGUAGE_SWITCHER_VARIANTS = {
  DROPDOWN: "dropdown",
  INLINE: "inline",
} as const;
