import { getBusinesses } from "@/services/businessService";
import { BusinessListResponse } from "@/types/business";
import { useQuery } from "@tanstack/react-query";

export function useBusinesses(params?: Record<string, string | number | boolean>) {
  return useQuery<BusinessListResponse>({
    queryKey: ["businesses", params],
    queryFn: () => getBusinesses(params),
  });
}
