import { API_ROUTES } from "@/config/apiRoute";
import { STORAGE_KEYS } from "@/config/common";
import { http } from "@/lib/axios";
import {
  LoginDTO,
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

export const login = async (data: LoginDTO) => {
  const res = await http.post(API_ROUTES.LOGIN, data);
  console.log("Login Response --->", res);

  if (res.status != 200) {
    throw new Error(res?.data?.message || "Unknown error occurred");
  }

  return res.data;
};

export const getCurrentUser = () => {
  try {
    const res = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    return res ? (JSON.parse(res) as UserAuthResponse) : null;
  } catch (e) {
    console.log("Error fetching current user", e);
    return null;
  }
};
