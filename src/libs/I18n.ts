import { LOCALE_COOKIE } from "@/constants";
import { resolveRequestLocale } from "@/utils/locale.util";
import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

// * next-intl without locale routing: the language is the visitor's, not the URL's
export default getRequestConfig(async () => {
  const locale = resolveRequestLocale({
    cookieLocale: (await cookies()).get(LOCALE_COOKIE.NAME)?.value,
    acceptLanguage: (await headers()).get("accept-language"),
  });
  return {
    locale,
    messages: (await import(`../i18n/locales/${locale}.json`)).default,
  };
});
