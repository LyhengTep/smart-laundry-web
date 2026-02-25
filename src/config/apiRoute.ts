export const API_ROUTES = {
  REGISTER_USER: "/auths/signup",
  LOGIN: "/auths/login",
  FETCH_BUSINESSES: "/businesses/",
  FETCH_DRIVERS: "/drivers",
  APPROVE_DRIVER: (id: string) => `/drivers/${id}/approve`,
  REJECT_DRIVER: (id: string) => `/drivers/${id}/reject`,
  GET_DRIVER: (id: string) => `/drivers/${id}`,
  UPDATE_DRIVER: (id: string) => `/drivers/${id}`,
  SUSPEND_DRIVER: (id: string) => `/drivers/${id}/suspend`,
};
