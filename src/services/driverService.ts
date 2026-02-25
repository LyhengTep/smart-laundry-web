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

export const getDriverById = async (driverId: string) => {
  const res = await http.get(API_ROUTES.GET_DRIVER(driverId));

  return res?.data?.data ?? res?.data;
};

export const updateDriver = async (
  driverId: string,
  payload: {
    id_card_number: string;
    license_number: string | null;
    plate_number: string;
    vehicle_color: string;
    vehicle_type: string;
    user: {
      full_name: string;
      email: string;
      user_name: string;
      phone: string;
      role: string;
      status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "REJECTED";
    };
  },
) => {
  const res = await http.put(API_ROUTES.UPDATE_DRIVER(driverId), payload);

  return res?.data;
};

export const suspendDriver = async (driverId: string) => {
  const res = await http.patch(API_ROUTES.SUSPEND_DRIVER(driverId));

  return res?.data;
};
