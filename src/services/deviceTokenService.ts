import { API_ROUTES } from "@/config/apiRoute";
import { http } from "@/lib/axios";
import {
  DeviceToken,
  DeviceTokenListResponse,
  DeviceTokenPayload,
} from "@/types/deviceToken";

export const createDeviceToken = async (payload: DeviceTokenPayload) => {
  const res = await http.post<DeviceToken>(API_ROUTES.DEVICE_TOKENS, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return res.data;
};

export const registerDeviceToken = async (payload: DeviceTokenPayload) => {
  console.log("Registering device token with payload:", payload);
  const res = await http.post<DeviceToken>(
    API_ROUTES.REGISTER_DEVICE_TOKEN,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return res.data;
};

export const updateDeviceToken = async (
  id: number,
  payload: Partial<DeviceTokenPayload>,
) => {
  const res = await http.patch<DeviceToken>(
    API_ROUTES.DEVICE_TOKEN(id),
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return res.data;
};

export const getDeviceTokensByUserId = async (userId: number) => {
  const res = await http.get<DeviceTokenListResponse>(
    API_ROUTES.DEVICE_TOKENS_BY_USER(userId),
  );

  return res.data;
};

export const getDeviceTokensByDriverId = async (driverId: number) => {
  const res = await http.get<DeviceTokenListResponse>(
    API_ROUTES.DEVICE_TOKENS_BY_DRIVER(driverId),
  );

  return res.data;
};

export const deleteDeviceToken = async (id: number) => {
  const res = await http.delete(API_ROUTES.DEVICE_TOKEN(id));
  return res.data;
};
