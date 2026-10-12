import { LOCALES } from "./locales.constant";

// * each language in its own name, so a reader finds theirs whatever language the page is in
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
