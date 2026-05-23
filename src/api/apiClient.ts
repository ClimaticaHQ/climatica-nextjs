import { AxiosRequestConfig } from "axios";
import { axiosInstance } from "./axiosConfig";

class APIClient {
  get<T = unknown>(config: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: "GET" });
  }
  post<T = unknown>(config: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: "POST" });
  }
  put<T = unknown>(config: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: "PUT" });
  }
  delete<T = unknown>(config: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: "DELETE" });
  }
  request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
    return axiosInstance.request<unknown, T>(config);
  }
}

export const apiClient = new APIClient();
