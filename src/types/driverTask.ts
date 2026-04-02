import { LaundryOrder } from "./order";

export type DriverTaskTab = "tasks" | "history" | "profile";

export type DriverTaskType = "PICKUP" | "DELIVERY" | "CANCELLED";

export interface DriverTaskRequest {
  id: string;
  customerName: string;
  type: DriverTaskType;
  address: string;
  shopName: string;
  distance: string;
  payout: number;
  lat?: number | null;
  lng?: number | null;
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
};

export interface DriverTask extends DriverTaskRequest {
  status: "IN_PROGRESS" | "COMPLETED";
}

export interface DriverStats {
  availableBalance: number;
  deliveries: number;
  rating: number;
  ratingNote: string;
  deliveriesDelta: string;
}
