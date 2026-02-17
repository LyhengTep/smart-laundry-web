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
