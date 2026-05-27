import { getRequestConfig } from "next-intl/server";
import { parseLocale } from "./I18nRouting";

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = parseLocale(await requestLocale);
  return {
    locale,
    messages: (await import(`../i18n/locales/${locale}.json`)).default,
  };
});
