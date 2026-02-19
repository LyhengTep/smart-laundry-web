import { API_ROUTES } from "@/config/apiRoute";
import { http } from "@/lib/axios";
import { DriverParams } from "@/types/driver";

export const getDrivers = async (params: DriverParams) => {
  const res = await http.get(API_ROUTES.FETCH_DRIVERS, {
    params,
  });

  console.log("Driver result", res);

  return res?.data;
};

export const approveDriver = async (driverId: string) => {
  const res = await http.patch(API_ROUTES.APPROVE_DRIVER(driverId));

  return res?.data;
};

export const rejectDriver = async (driverId: string) => {
  const res = await http.patch(API_ROUTES.REJECT_DRIVER(driverId));

  return res?.data;
};
