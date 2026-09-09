export const LANGUAGES = [
  { code: "de", label: "DE 🇩🇪" },
  { code: "el", label: "EL 🇬🇷" },
  { code: "en", label: "EN 🇬🇧" },
  { code: "es", label: "ES 🇪🇸" },
  { code: "fr", label: "FR 🇫🇷" },
  { code: "it", label: "IT 🇮🇹" },
  { code: "pt", label: "PT 🇵🇹" },
  { code: "uk", label: "UA 🇺🇦" },
];

export const DEFAULT_LANGUAGE = LANGUAGES[2].code; // * "en"

export const SUPPORTED_LANGUAGE_CODES = new Set(LANGUAGES.map(({ code }) => code));

export const LANGUAGE_SWITCHER_VARIANTS = {
  DROPDOWN: "dropdown",
  INLINE: "inline",
} as const;
