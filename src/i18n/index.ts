import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en, es, uk } from "./locales";

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      uk: { translation: uk },
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    nonExplicitSupportedLngs: true,
  });
}

export default i18n;
