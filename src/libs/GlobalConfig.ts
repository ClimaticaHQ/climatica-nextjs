import { env } from "./Env";

export type GlobalConfig = {
  appName: string;
  appVersion: string;
};

export const GLOBAL_CONFIG: GlobalConfig = {
  appName: "Climatica",
  // * package.json's version (next.config inlines it)
  appVersion: env.NEXT_PUBLIC_APP_VERSION,
};
