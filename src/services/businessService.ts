import { API_ROUTES } from "@/config/apiRoute";
import { http } from "@/lib/axios";
import {
  BusinessListResponse,
  BusinessRequest,
  BusinessResponse,
  BusinessServiceRequest,
  LaundryServiceResponse,
} from "@/types/business";

export const getBusinesses = async (
  params?: Record<string, string | number | boolean>,
): Promise<BusinessListResponse> => {
  const res = await http.get<BusinessListResponse>(
    API_ROUTES.FETCH_BUSINESSES,
    {
      params,
    },
  );

  return res.data;
};

export const getLaundryServices = async (
  params?: Record<string, string | number | boolean>,
): Promise<LaundryServiceResponse[]> => {
  const res = await http.get<LaundryServiceResponse[]>(
    API_ROUTES.FETCH_LAUNDRY_SERVICES,
    {
      params,
    },
  );

  return res.data;
};

export const createBusiness = async (
  data: BusinessRequest,
): Promise<BusinessResponse> => {
  const res = await http.post(API_ROUTES.CREATE_BUSINESS, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return res.data;
};

export const createBusinessServices = async (
  data: BusinessServiceRequest[],
) => {
  const res = await http.post(API_ROUTES.CREATE_BUSINESS_SERVICES, data);

  return res.data;
};
