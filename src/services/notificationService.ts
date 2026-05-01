import { API_ROUTES } from "@/config/apiRoute";
import { http } from "@/lib/axios";
import {
  Notification,
  NotificationListResponse,
  NotificationQueryParams,
} from "@/types/notification";

export const getMyNotifications = async (
  params?: NotificationQueryParams,
): Promise<NotificationListResponse> => {
  const query: Record<string, string | number> = {};
  if (params?.page !== undefined) query.page = params.page;
  if (params?.size !== undefined) query.size = params.size;
  if (params?.is_read !== undefined) query.is_read = params.is_read ? "true" : "false";

  const res = await http.get<NotificationListResponse>(
    API_ROUTES.FETCH_MY_NOTIFICATIONS,
    { params: query },
  );
  return res.data;
};

export const markNotificationRead = async (
  notificationId: string,
): Promise<Notification> => {
  const res = await http.patch<Notification>(
    API_ROUTES.MARK_NOTIFICATION_READ(notificationId),
  );
  return res.data;
};
