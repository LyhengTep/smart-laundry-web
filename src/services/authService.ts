import { API_ROUTES } from "@/config/apiRoute";
import { http } from "@/lib/axios";
import { LoginDTO, RegisterUserDTO } from "@/types/auth";

export const registerUser = async (data: RegisterUserDTO) => {
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
