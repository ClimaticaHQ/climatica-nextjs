import type { TLocale } from "@/types";

declare module "next-intl" {
  interface AppConfig {
    Locale: TLocale;
  }
}
