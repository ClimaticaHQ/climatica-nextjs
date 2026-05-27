import { FEATURE_CODE_LABELS } from "@/constants/geonames.constant";

export function getCityDescription(featureCode: string, countryCode: string, lang = "en"): string {
  const normalizedLang = lang === "ua" ? "uk" : lang;
  const supportedLang = ["en", "uk", "es"].includes(normalizedLang) ? normalizedLang : "en";

  const feature =
    FEATURE_CODE_LABELS[featureCode]?.[supportedLang] ??
    FEATURE_CODE_LABELS[featureCode]?.["en"] ??
    null;

  const country = (() => {
    try {
      return (
        new Intl.DisplayNames([supportedLang, "en"], { type: "region" }).of(countryCode) ??
        countryCode
      );
    } catch {
      return countryCode;
    }
  })();

  if (feature) return `${feature} · ${country}`;
  return country;
}
