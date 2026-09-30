import type { useRouter } from "@/libs/I18nNavigation";
import type { TLocale } from "@/types";

export type TAppRouter = ReturnType<typeof useRouter>;

export type TNavigateWithIntentArgs = {
  router: TAppRouter;
  /** the route without its locale prefix, as the i18n router takes it */
  pathname: string;
  query: Record<string, string>;
  locale: TLocale;
};
