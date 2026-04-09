import axios from "axios";
import { API_BASE_URL } from "@/utils/constants";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.response.use(
  (r) => r,
  (error) => {
    // eslint-disable-next-line no-console
    console.error("API error", error?.response?.status, error?.response?.data);
    return Promise.reject(error);
  },
);
