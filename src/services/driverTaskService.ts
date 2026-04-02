import { API_ROUTES } from "@/config/apiRoute";
import { http } from "@/lib/axios";
import { DriverStats, DriverTask, DriverTaskRequest } from "@/types/driverTask";

export const getDriverTaskWsUrl = (driver_id?: string) => {
  const socketPath = driver_id
    ? `/api/v1/ws/assignment/${driver_id}`
    : "/api/v1/ws/testing";
  const configured = process.env.NEXT_PUBLIC_DRIVER_WS_URL;
  if (configured) return configured;

  const baseApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (baseApiUrl) {
    const wsBase = baseApiUrl
      .replace(/^https?:\/\//, (value) =>
        value.startsWith("https") ? "wss://" : "ws://",
      )
      .replace(/\/api\/v1\/?$/, "");
    return `${wsBase}${socketPath}`;
  }

  return `ws://localhost:8000${socketPath}`;
};

export const acceptDriverTask = async (taskId: string) => {
  try {
    const response = await http.patch(API_ROUTES.ACCEPT_DRIVER_TASK(taskId));

    if (!response.status.toString().startsWith("2")) {
      throw new Error("Failed to accept task");
    }
  } catch (error) {
    console.error("Error accepting driver task:", error);
    throw error;
  }
};

export const getDriverTasks = async (driverId: string) => {
  const res = await http.get(API_ROUTES.DRIVER_ASSIGNEMNTS, {
    params: {
      driver_id: driverId,
    },
  });

  return res?.data;
};
export const DEFAULT_DRIVER_REQUEST: DriverTaskRequest = {
  id: "REQ-8821",
  customerName: "James Wilson",
  type: "PICKUP",
  address: "West Library, Table 12",
  shopName: "Bubbles & Suds",
  distance: "0.8 km",
  payout: 4.5,
};

export const DEFAULT_ACTIVE_DRIVER_TASKS: DriverTask[] = [
  {
    id: "TSK-102",
    customerName: "Maria G.",
    type: "DELIVERY",
    address: "Faculty Housing, Apt 9",
    shopName: "Bubbles & Suds",
    distance: "1.2 km",
    status: "IN_PROGRESS",
    payout: 5.2,
  },
];

export const DEFAULT_DRIVER_STATS: DriverStats = {
  availableBalance: 1240.5,
  deliveries: 128,
  rating: 4.9,
  ratingNote: "Top 5%",
  deliveriesDelta: "+12",
};
