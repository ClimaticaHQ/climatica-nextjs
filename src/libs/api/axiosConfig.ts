import { TIME } from "@/constants";
import axios from "axios";
import { logger } from "../Logger";

export const axiosInstance = axios.create({
  baseURL: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
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
