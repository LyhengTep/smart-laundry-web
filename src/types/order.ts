export type OrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "PICKED_UP"
  | "DELIVERED_TO_SHOP"
  | "WASHING"
  | "READY_FOR_DELIVERY"
  | "OUT_FOR_DELIVERY"
  | "COMPLETED"
  | "CANCELLED"
  | string;

export interface LaundryOrderLine {
  id: string;
  business_service_id: string;
  service_id: number;
  service_name: string;
  pricing_type: "per_kg" | "per_item" | "fixed" | string;
  measure_type: "kg" | "item" | string;
  unit_price: number;
  quantity: number;
  sub_total: number;
  note?: string | null;
}

export interface LaundryOrder {
  id: string;
  order_no: string;
  customer_id: string;
  business_id: string;
  driver_id?: string | null;
  status: OrderStatus;
  pickup_method?: string;
  placed_at: string;
  scheduled_pickup_at?: string | null;
  scheduled_dropoff_at?: string | null;
  pickup_address?: string;
  delivery_address?: string;
  notes?: string | null;
  subtotal: number;
  discount: number;
  total: number;
  created_at: string;
  updated_at: string;
  items: LaundryOrderLine[];
}

export interface LaundryOrderListResponse {
  items: LaundryOrder[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface OrderQueryParams {
  customer_id?: string;
  business_id?: string;
  order_no?: string;
  status?: string;
  page?: number;
  size?: number;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  driver_id?: string | null;
}

export interface UpdateOrderPricingItem {
  order_item_id: string;
  quantity: number;
}

export interface UpdateOrderPricingRequest {
  items: UpdateOrderPricingItem[];
  discount: number;
}

export interface CreateOrderItemRequest {
  business_service_id: string;
  quantity: number;
  note?: string;
}

export interface CreateOrderRequest {
  customer_id: string;
  business_id: string;
  pickup_method: "PICKUP" | "DROPOFF" | string;
  pickup_address: string;
  delivery_address: string;
  notes?: string;
  discount: number;
  scheduled_pickup_at: string;
  scheduled_dropoff_at: string;
  pickup_latitude: number;
  pickup_longitude: number;
  delivery_latitude: number;
  delivery_longitude: number;
  items: CreateOrderItemRequest[];
}
