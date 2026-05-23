import { env } from "./Env";

export type GlobalConfig = {
  appName: string;
  appVersion: string;
  apiBaseUrl: string;
};

export const GLOBAL_CONFIG: GlobalConfig = {
  appName: "Climatica",
  appVersion: "1.0.0",
  apiBaseUrl: env.BASE_BACKEND_URL + env.BASE_API_PREFIX,
};
