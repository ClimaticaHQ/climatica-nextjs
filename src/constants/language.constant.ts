export const LANGUAGES = [
  { code: "en", label: "EN 🇬🇧" },
  { code: "es", label: "ES 🇪🇸" },
  { code: "uk", label: "UA 🇺🇦" },
];

export const DEFAULT_LANGUAGE = LANGUAGES[0].code; // * "en"

export const SUPPORTED_LANGUAGE_CODES = new Set(LANGUAGES.map(({ code }) => code));

export const LANGUAGE_SWITCHER_VARIANTS = {
  DROPDOWN: "dropdown",
  INLINE: "inline",
} as const;
