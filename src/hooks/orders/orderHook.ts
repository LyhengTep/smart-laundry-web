import { getOrders } from "@/services/orderService";
import { OrderQueryParams } from "@/types/order";
import { useQuery } from "@tanstack/react-query";

export function useOrders(params?: OrderQueryParams) {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: () => getOrders(params),
    enabled: Boolean(params?.business_id || params?.customer_id || params?.order_no),
  });
}
