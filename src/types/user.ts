import { RoleName } from "./auth";

export interface UserDriver {
  id: string;
  user_id: string;
  plate_number: string;
  id_card_number: string;
  vehicle_type: string;
  license_number: string;
  vehicle_color: string;
}

export interface User {
  id: string;
  full_name: string;
  user_name: string;
  email: string;
  phone: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "REJECTED";
  role: RoleName;
  created_at: string;
  updated_at: string;
  driver?: UserDriver | null;
}

export interface UserListResponse {
  items: User[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface UserQueryParams {
  role?: string;
  status?: string;
  page?: number;
  size?: number;
}

export interface UserUpdateRequest {
  full_name: string;
  user_name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  password: string;
  msg_token?: string;
}
