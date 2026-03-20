export type OrderSection = "orders" | "history";

export type OrderItem = {
  orderId: string;
  id: string;
  customer: string;
  service: string;
  weight: string;
  price: string;
  status: string;
  pickupAt: string;
  dropoffAt: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  notes?: string;
  subtotal?: number;
  discount?: number;
  total?: number;
  lineItems?: OrderLineItem[];
};

export type PendingOrderItem = {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
};

export type OrderLineItem = {
  id: string;
  serviceName: string;
  pricingType: string;
  measureType: string;
  unitPrice: number;
  quantity: number;
  subTotal: number;
  note?: string | null;
};
