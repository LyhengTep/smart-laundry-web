import { getLaundryServices } from "@/services/businessService";
import { LaundryServiceResponse } from "@/types/business";
import { useQuery } from "@tanstack/react-query";

export function useLaundryServices(
  params?: Record<string, string | number | boolean>,
) {
  return useQuery<LaundryServiceResponse[]>({
    queryKey: ["laundry-services", params],
    queryFn: () => getLaundryServices(params),
  });
}
