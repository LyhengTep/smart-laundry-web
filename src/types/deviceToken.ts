export type DeviceType = "ios" | "android" | "web" | string;

export interface DeviceToken {
  id: number;
  user_id: number | string | null;
  driver_id: number | string | null;
  token: string;
  device_type: DeviceType;
  created_at: string;
  updated_at: string;
}

export interface DeviceTokenPayload {
  user_id?: number | string | null;
  driver_id?: number | string | null;
  token: string;
  device_type: DeviceType;
}

export interface DeviceTokenListResponse {
  items: DeviceToken[];
  total?: number;
  page?: number;
  size?: number;
  pages?: number;
}
