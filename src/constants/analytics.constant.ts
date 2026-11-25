import { ROUTES } from "./route.constant";
import { TIME } from "./time.constant";

export const ANALYTICS_CONSENT = {
  // * raise the version when what Climatica collects changes: every stored choice is asked again
  VERSION: 1,
  MAX_AGE_MS: 365 * TIME.IN_MILLISECONDS.DAY,
} as const;

// * the cookies GA4 sets: _ga and _ga_<container>
export const GA_COOKIE_PATTERN = /^_ga(_.+)?$/;

// * GA's own opt-out: gtag sends nothing while window["ga-disable-<ID>"] is true
export const GA_DISABLE_PREFIX = "ga-disable-";

export const GA_DEFAULT_CONSENT = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "granted",
} as const;

export const GA_DEFAULT_SETTINGS = {
  allow_google_signals: false,
  allow_ad_personalization_signals: false,
  send_page_view: false,
} as const;

export const GA_PAGE_VIEW_EVENT = "page_view";

// * GA user properties our code sets; app_language is the interface's locale code ("de"), never
// * a language's name. It's a custom dimension (user scope) in the property (docs/operations.md)
export const GA_USER_PROPERTIES = {
  COMMAND: "user_properties",
  APP_LANGUAGE: "app_language",
} as const;

// * every value our code sets on GA hits is English
export const GA_PAGE_TITLES: Readonly<Record<string, string>> = {
  [ROUTES.CLIMATE_STATISTICS]: "City Climate",
  [ROUTES.COMPARE_CITIES]: "Compare Cities",
  [ROUTES.COMPARE_PERIODS]: "Compare Periods",
  [ROUTES.HEAT_MAP]: "Region Heatmap",
  [ROUTES.ABOUT]: "About",
  [ROUTES.ABOUT_GUIDE]: "User guide",
  [ROUTES.ABOUT_DATA]: "Data & methods",
  [ROUTES.SETTINGS]: "Settings",
};

export const CONSENT_BANNER_HEIGHT_VARIABLE = "--consent-banner-height";
