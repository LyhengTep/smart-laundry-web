import { STORAGE_KEYS } from "@/config/common";
import axios from "axios";

const rawBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:8000/api/v1";

const resolveApiBaseUrl = () => {
  if (typeof window === "undefined") return rawBaseUrl;
  if (
    window.location.protocol === "https:" &&
    rawBaseUrl.startsWith("http://")
  ) {
    return rawBaseUrl.replace("http://", "https://");
  }
  return rawBaseUrl;
};

export const http = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 10000,
});
http.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;
  const user = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
  const token = user ? JSON.parse(user)?.token : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
