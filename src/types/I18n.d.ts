import type { routing } from "@/libs/I18nRouting";

declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
  }
}
