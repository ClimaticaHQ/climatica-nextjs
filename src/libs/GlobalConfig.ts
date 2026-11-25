import { env } from "./Env";

export type GlobalConfig = {
  appName: string;
  appVersion: string;
  analyticsId: string;
};

export const GLOBAL_CONFIG: GlobalConfig = {
  appName: "Climatica",
  appVersion: env.NEXT_PUBLIC_APP_VERSION,
  analyticsId: env.NEXT_PUBLIC_GA_ID,
};
