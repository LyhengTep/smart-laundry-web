export const API_ROUTES = {
  REGISTER_USER: "/auths/signup",
  LOGIN: "/auths/login",
  LOGOUT: "/auths/logout",
  FETCH_BUSINESSES: "/businesses/",
  GET_BUSINESS: (id: string) => `/businesses/${id}`,
  UPDATE_BUSINESS: (id: string) => `/businesses/${id}`,
  FETCH_LAUNDRY_SERVICES: "/laundry-services/",
  FETCH_DRIVERS: "/drivers",
  FETCH_ORDERS: "/orders",
  CREATE_ORDER: "/orders/",
  UPDATE_ORDER_STATUS: (order_id: string) => `/orders/${order_id}/status`,
  UPDATE_ORDER_PRICING: (order_id: string) => `/orders/${order_id}/pricing`,
  APPROVE_DRIVER: (id: string) => `/drivers/${id}/approve`,
  REJECT_DRIVER: (id: string) => `/drivers/${id}/reject`,
  GET_DRIVER: (id: string) => `/drivers/${id}`,
  GET_DRIVER_BY_USER: (user_id: string) => `/drivers/by-user/${user_id}`,
  UPDATE_DRIVER: (id: string) => `/drivers/${id}`,
  SUSPEND_DRIVER: (id: string) => `/drivers/${id}/suspend`,
  CREATE_BUSINESS: "/businesses/",
  DELETE_BUSINESS: (business_id: string) => `/businesses/${business_id}`,
  CREATE_BUSINESS_SERVICES: "/business-services/bulk",

  ACCEPT_DRIVER_TASK: (taskId: string) =>
    `/drivers/assignments/${taskId}/accept`,
  MARK_ASSIGNMENT_PICKED_UP: (assignmentId: string) =>
    `/drivers/assignments/${assignmentId}/picked-up`,
  MARK_ASSIGNMENT_DELIVERED: (assignmentId: string) =>
    `/drivers/assignments/${assignmentId}/delivered`,

  DRIVER_ASSIGNEMNTS: "/drivers/assignments/",
  DEVICE_TOKENS: "/device-tokens",
  REGISTER_DEVICE_TOKEN: "/device-tokens/register",
  DEVICE_TOKEN: (id: number) => `/device-tokens/${id}`,
  DEVICE_TOKENS_BY_USER: (user_id: number) =>
    `/device-tokens/by-user/${user_id}`,
  DEVICE_TOKENS_BY_DRIVER: (driver_id: number) =>
    `/device-tokens/by-driver/${driver_id}`,

  GET_ACTIVE_ASSIGNMENT: "/drivers/pending/get-current-assignment",
};
