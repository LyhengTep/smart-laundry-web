import { STORAGE_KEYS } from "@/config/common";
import axios from "axios";

export const http = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  timeout: 10000,
});

http.interceptors.request.use((config) => {
  const user = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
  const token = user ? JSON.parse(user)?.token : null;
  console.log("Attaching token to request:", token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
