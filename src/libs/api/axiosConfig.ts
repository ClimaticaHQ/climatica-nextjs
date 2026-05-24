import { ERROR_CONSTANTS, TIME } from "@/constants";
import { GLOBAL_CONFIG } from "@/libs/GlobalConfig";
import { userStore } from "@/stores";
import type { TApiResponse } from "@/types/api/common";
import axios, { type AxiosError, type AxiosResponse } from "axios";

export const axiosInstance = axios.create({
  baseURL: GLOBAL_CONFIG.apiBaseUrl,
  timeout: TIME.IN_MILLISECONDS.FIFTY_SECONDS,
  headers: { "Content-Type": "application/json;charset=utf-8" },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = userStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error instanceof Error ? error : new Error(String(error))),
);

axiosInstance.interceptors.response.use(
  <T>(res: AxiosResponse<TApiResponse<T>>) => {
    if (!res.data) throw new Error(ERROR_CONSTANTS.API_REQUEST_FAILED);
    return res;
  },
  (error: AxiosError<TApiResponse<unknown>>) => {
    const { response, message } = error;

    const errMsg = response?.data?.message ?? message ?? ERROR_CONSTANTS.API_REQUEST_FAILED;

    if (response?.status === 401) {
      userStore.getState().actions.clearUserInfoAndToken();
    }

    return Promise.reject(
      error instanceof Error ? Object.assign(error, { message: errMsg }) : new Error(errMsg),
    );
  },
);
