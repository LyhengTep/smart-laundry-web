import { API_ROUTES } from "@/config/apiRoute";
import { http } from "@/lib/axios";
import { UserListResponse, UserQueryParams } from "@/types/user";

export const getUsers = async (
  params?: UserQueryParams,
): Promise<UserListResponse> => {
  const res = await http.get<UserListResponse>(API_ROUTES.FETCH_USERS, {
    params,
  });
  return res.data;
};
