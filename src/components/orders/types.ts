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
  pickupFee?: number | null;
  deliveryFee?: number | null;
  lineItems?: OrderLineItem[];
};

export type PendingOrderItem = {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  customer: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  pickupLat?: number | null;
  pickupLng?: number | null;
  deliveryLat?: number | null;
  deliveryLng?: number | null;
  scheduledPickupAt?: string;
  scheduledDropoffAt?: string;
  notes?: string;
  total: number;
  pickupFee?: number | null;
  lineItems: OrderLineItem[];
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
