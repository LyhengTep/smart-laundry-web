import { getMyNotifications, markNotificationRead } from "@/services/notificationService";
import { NotificationQueryParams } from "@/types/notification";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useNotifications(params?: NotificationQueryParams) {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: () => getMyNotifications(params),
    refetchInterval: 30_000,
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const res = await getMyNotifications({ is_read: false, size: 1 });
      return res.total;
    },
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
