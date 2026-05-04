import { API_ROUTES } from "@/config/apiRoute";
import { http } from "@/lib/axios";
import { AdminRegisterRequest, User, UserListResponse, UserQueryParams, UserUpdateRequest } from "@/types/user";

export const getUsers = async (
  params?: UserQueryParams,
): Promise<UserListResponse> => {
  const res = await http.get<UserListResponse>(API_ROUTES.FETCH_USERS, {
    params,
  });
  return res.data;
};

export const getUser = async (userId: string): Promise<User> => {
  const res = await http.get<User>(API_ROUTES.GET_USER(userId));
  return res.data;
};

export const updateUser = async (
  userId: string,
  data: UserUpdateRequest,
): Promise<User> => {
  const res = await http.patch<User>(API_ROUTES.UPDATE_USER(userId), data);
  return res.data;
};

export const approveUser = async (userId: string): Promise<void> => {
  await http.patch(API_ROUTES.APPROVE_USER(userId));
};

export const deactivateUser = async (userId: string): Promise<void> => {
  await http.patch(API_ROUTES.DEACTIVATE_USER(userId));
};

export const registerAdmin = async (data: AdminRegisterRequest): Promise<User> => {
  const res = await http.post<User>(API_ROUTES.REGISTER_ADMIN, data);
  return res.data;
};

