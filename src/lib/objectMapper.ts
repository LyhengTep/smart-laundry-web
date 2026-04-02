import {
  DriverAssignmentResponse,
  DriverTaskRequest,
} from "@/types/driverTask";

export const convertAssignmentToDriverTask = (
  assignment: DriverAssignmentResponse,
): DriverTaskRequest => {
  let isPickup = assignment.order?.pickup_method == "PICKUP";
  let task: DriverTaskRequest = {
    id: assignment.id,
    customerName: assignment.order?.customer?.full_name || "Unknown Customer",
    type: assignment.role, // Assuming all tasks are pickups for simplicity
    address: assignment.order?.pickup_address || "Unknown Address",
    shopName: assignment.order?.business?.name || "Unknown Shop",
    distance: "-", // Distance calculation would require additional data
    payout: 0, // Example payout calculation (10% of total)
    lat: isPickup
      ? assignment.order?.pickup_latitude || null
      : assignment.order?.delivery_latitude || null,
    lng: isPickup
      ? assignment.order?.pickup_longitude || null
      : assignment.order?.delivery_longitude || null,
  };

  console.log("driver task map ", task);

  return task;
};
