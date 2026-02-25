import { API_ROUTES } from "@/config/apiRoute";
import { http } from "@/lib/axios";
import { BusinessListResponse } from "@/types/business";

export const getBusinesses = async (
  params?: Record<string, string | number | boolean>,
): Promise<BusinessListResponse> => {
  const res = await http.get<BusinessListResponse>(API_ROUTES.FETCH_BUSINESSES, {
    params,
  });

  return res.data;
};
