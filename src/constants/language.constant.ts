import { LOCALES } from "./locales.constant";

const LANGUAGE_NATIVE_NAMES: Readonly<Record<string, string>> = {
  de: "Deutsch",
  el: "Ελληνικά",
  en: "English",
  es: "Español",
  fr: "Français",
  it: "Italiano",
  nb: "Norsk bokmål",
  pt: "Português",
  ro: "Română",
  uk: "Українська",
};

export const LANGUAGES = LOCALES.map((code) => ({
  code,
  label: LANGUAGE_NATIVE_NAMES[code] ?? code.toUpperCase(),
}));
