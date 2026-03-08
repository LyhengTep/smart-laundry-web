export interface RegisterUserDTO {
  full_name: string;
  user_name: string;
  password: string;
  email: string;
  phone: string;
  role: RoleName;
}

export interface RegisterDriverDTO extends RegisterUserDTO {
  id_number: string;
  vehicle_type: string;
  plate_number: string;
  license_number: string;
  vehicle_color: string;
}

export interface LoginDTO {
  login: string;
  password: string;
  role: string;
  // email: string;
  // phone: string;
  // role: RoleName;
}

export type UserAuthResponse = {
  id: string; // UUID
  full_name: string;
  user_name: string;
  email: string;
  phone: string;
  status: "ACTIVE" | "INACTIVE";
  role: RoleName;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
  token: string; // JWT
};

type RoleName = "ADMIN" | "MERCHANT" | "DRIVER" | "CUSTOMER";
