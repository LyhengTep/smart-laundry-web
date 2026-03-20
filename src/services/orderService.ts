import { API_ROUTES } from "@/config/apiRoute";
import { http } from "@/lib/axios";
import {
  CreateOrderRequest,
  LaundryOrderListResponse,
  OrderQueryParams,
  UpdateOrderPricingRequest,
  UpdateOrderStatusRequest,
} from "@/types/order";

export const getOrders = async (
  params?: OrderQueryParams,
): Promise<LaundryOrderListResponse> => {
  const res = await http.get<LaundryOrderListResponse>(
    API_ROUTES.FETCH_ORDERS,
    {
      params,
    },
  );

  return res.data;
};

export const updateOrderStatus = async (
  orderId: string,
  data: UpdateOrderStatusRequest,
) => {
  const res = await http.patch(API_ROUTES.UPDATE_ORDER_STATUS(orderId), data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return res.data;
};

export const updateOrderPricing = async (
  orderId: string,
  data: UpdateOrderPricingRequest,
) => {
  const res = await http.patch(API_ROUTES.UPDATE_ORDER_PRICING(orderId), data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return res.data;
};

export const createOrder = async (data: CreateOrderRequest) => {
  const res = await http.post(API_ROUTES.CREATE_ORDER, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return res.data;
};
