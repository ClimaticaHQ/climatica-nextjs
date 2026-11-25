import { env } from "./Env";

export type GlobalConfig = {
  appName: string;
  appVersion: string;
  /** the GA4 measurement ID; empty: no analytics code, no consent banner */
  analyticsId: string;
};

export const GLOBAL_CONFIG: GlobalConfig = {
  appName: "Climatica",
  // * package.json's version (next.config inlines it)
  appVersion: env.NEXT_PUBLIC_APP_VERSION,
  analyticsId: env.NEXT_PUBLIC_GA_ID,
};
