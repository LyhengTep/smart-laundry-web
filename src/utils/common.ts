import { BASE_URL, DEFAULT_SHOP_IMAGE } from "@/config/common";
import { UserAuthResponse } from "@/types/auth";
import { DriverTask } from "@/types/driverTask";

export const formatLaundryServiceType = (type: string) => {
  switch (type) {
    case "WASH":
      return "Wash & Fold";
    case "DRY_CLEAN":
      return "Dry Cleaning";
    case "IRON":
      return "Ironing";
    default:
      return type;
  }
};

export const getLaundryServicePic = (type: string) => {
  switch (type) {
    case "WASH":
      return "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?q=80&w=400&auto=format&fit=crop";
    case "DRY_CLEAN":
      return "https://images.unsplash.com/photo-1549037173-e3b717902c57?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
    case "IRON":
      return "https://images.unsplash.com/photo-1662221156544-3355c817ed74?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
    default:
      return "";
  }
};

export const getQuickLink = (user: UserAuthResponse | null) => {
  if (!user) return { href: "/auth/login", label: "My Orders" };
  if (user.role === "CUSTOMER") {
    return {
      href: `/customers/${user.id}/my-orders`,
      label: "My Orders",
    };
  }
  if (user.role === "MERCHANT") {
    return { href: "/businesses-admin", label: "Dashboard" };
  }
  if (user.role === "ADMIN") {
    return { href: "/admin/drivers", label: "Dashboard" };
  }
  return { href: "/", label: "Dashboard" };
};

export const getMapDirection = (task: DriverTask) => {
  return `https://www.google.com/maps/dir/?api=1&destination=${task.status === "PICKED_UP" ? task.business?.latitude : task.lat},${task.status === "PICKED_UP" ? task.business?.longitude : task.lng}`;
};

export const resolveBusinessImage = (value?: string) => {
  if (!value || value === "string") return DEFAULT_SHOP_IMAGE;
  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("blob:")
  ) {
    return value;
  }
  return `${BASE_URL}${value}`;
};

export const formatTime = (value?: string) => {
  if (!value) return "-";
  const date = new Date(`1970-01-01T${value}`);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getDriverActiveTaskLabel = (status: string | undefined) => {
  switch (status) {
    case "PICKED_UP":
      return { label: "Mark as Delivered", nextAction: "delivered" as const };
    case "DELIVERED_TO_SHOP":
      return { label: "Completed", nextAction: null };
    case "OUT_FOR_DELIVERY":
      return { label: "Mark as Delivered", nextAction: "delivered" as const };
    case "DELIVERED":
      return { label: "Completed", nextAction: null };
    default:
      return { label: "Mark as Picked Up", nextAction: "picked-up" as const };
  }
};
