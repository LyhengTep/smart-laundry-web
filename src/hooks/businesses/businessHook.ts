import { getBusinessById, getBusinesses } from "@/services/businessService";
import { BusinessListResponse, BusinessResponse } from "@/types/business";
import { useQuery } from "@tanstack/react-query";

export function useBusinesses(
  params?: Record<string, string | number | boolean | undefined>,
) {
  return useQuery<BusinessListResponse>({
    queryKey: ["businesses", params],
    queryFn: () => getBusinesses(params),
  });
}

export function useBusiness(id: string) {
  return useQuery<BusinessResponse>({
    queryKey: ["business", id],
    queryFn: () => getBusinessById(id),
    enabled: !!id,
  });
}
