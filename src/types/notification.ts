export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  reference_id: string | null;
  reference_type: string | null;
  is_read: boolean;
  channel: string;
  status: string;
  created_at: string;
  read_at: string | null;
}

export interface NotificationListResponse {
  items: Notification[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface NotificationQueryParams {
  page?: number;
  size?: number;
  is_read?: boolean;
}
