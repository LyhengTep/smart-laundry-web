import { API_ROUTES } from "@/config/apiRoute";
import { http } from "@/lib/axios";
import {
  BusinessListResponse,
  BusinessRequest,
  BusinessResponse,
  BusinessServiceRequest,
  BusinessUpdateRequest,
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

export const getBusinessById = async (
  id: string,
): Promise<BusinessResponse> => {
  const res = await http.get<BusinessResponse>(API_ROUTES.GET_BUSINESS(id));
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

export const deleteBusiness = async (business_id: string) => {
  const res = await http.delete(API_ROUTES.DELETE_BUSINESS(business_id));
  return res.data;
};

export const updateBusiness = async (
  id: string,
  data: BusinessUpdateRequest,
): Promise<BusinessResponse> => {
  console.log("Updating business with data:", data); // Debug log to check the data being sent
  const res = await http.put<BusinessResponse>(
    API_ROUTES.UPDATE_BUSINESS(id),
    data,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  return res.data;
};
