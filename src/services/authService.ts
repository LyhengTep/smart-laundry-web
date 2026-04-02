import { API_ROUTES } from "@/config/apiRoute";
import { STORAGE_KEYS } from "@/config/common";
import { http } from "@/lib/axios";
import {
  LoginDTO,
  LogoutDTO,
  RegisterDriverDTO,
  RegisterUserDTO,
  UserAuthResponse,
} from "@/types/auth";

export const registerUser = async (
  data: RegisterDriverDTO | RegisterUserDTO,
) => {
  console.log("I have received a payload of ", data);
  const res = await http.post(API_ROUTES.REGISTER_USER, data);
  console.log("Response --->", res);

  if (res.status != 200) {
    throw new Error(res?.data?.message || "Unknown error occurred");
  }

  return res.data;
};

export const login = async (data: LoginDTO): Promise<UserAuthResponse> => {
  const res = await http.post(API_ROUTES.LOGIN, data);
  console.log("Login Response --->", res);

  if (res.status != 200) {
    throw new Error(res?.data?.message || "Unknown error occurred");
  }

  return res.data;
};

export const logout = async (data: LogoutDTO) => {
  const res = await http.post(API_ROUTES.LOGOUT, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return res.data;
};

export const getCurrentUser = () => {
  try {
    if (typeof window === "undefined") return null;
    const res = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    return res ? (JSON.parse(res) as UserAuthResponse) : null;
  } catch (e) {
    console.log("Error fetching current user", e);
    return null;
  }
};

export const clearAuthSession = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  localStorage.removeItem(STORAGE_KEYS.DRIVER_PROFILE);
};
