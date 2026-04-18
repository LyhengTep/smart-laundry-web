import { Business } from "./business";
import { LaundryOrder } from "./order";

export type DriverTaskTab = "tasks" | "history" | "profile";

export type DriverTaskType = "PICKUP" | "DELIVERY" | "CANCELLED";

export interface DriverTaskRequest {
  id: string;
  orderId?: string;
  orderStatus?: string;
  customerName: string;
  type: DriverTaskType;
  address: string;
  shopName: string;
  distance: string;
  status: DriverAssignmentStatus;
  payout: number;
  lat?: number | null;
  lng?: number | null;
  business?: Business | null;
  order?: LaundryOrder | null;
}

// export interface DriverAssignment {
//   id: string;
//   role: "PICKUP" | "DELIVERY" | "CANCELLED";
//   order: LaundryOrder | null;
//   customer: Partial<UserAuthResponse> | null;
//   laundry_business: Partial<BusinessResponse> | null;
// }
export type DriverAssignmentResponse = {
  id: string;
  role: "PICKUP" | "DELIVERY" | "CANCELLED";
  order: LaundryOrder | null;
  status: DriverAssignmentStatus;
  timeout?: number;
};

type DriverAssignmentStatus =
  | "ACCEPTED"
  | "PICKED_UP"
  | "DELIVERED"
  | "REJECTED";

export interface DriverTask extends DriverTaskRequest {
  // status: "IN_PROGRESS" | "COMPLETED";
}

export interface DriverStats {
  availableBalance: number;
  deliveries: number;
  rating: number;
  ratingNote: string;
  deliveriesDelta: string;
}
