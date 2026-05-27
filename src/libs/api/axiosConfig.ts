import { TIME } from "@/constants";
import { env } from "@/libs/Env";
import axios from "axios";
import { logger } from "../Logger";

export const axiosInstance = axios.create({
  baseURL: typeof window !== "undefined" ? window.location.origin : `http://localhost:${env.PORT}`,
  timeout: TIME.IN_MILLISECONDS.FIFTY_SECONDS,
  headers: { "Content-Type": "application/json" },
  paramsSerializer: { indexes: null },
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    logger.error(`[API] Request failed: ${error.message}`);
    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  },
);
