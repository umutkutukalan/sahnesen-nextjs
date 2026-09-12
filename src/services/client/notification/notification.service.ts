import api from "../config";

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type:
    | "BADGE_EARNED"
    | "FOLLOW"
    | "FOLLOWED_USER_POST"
    | "POST_LIKE"
    | "TICKET_PURCHASE"
    | "SYSTEM";
  targetUrl: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  getNotifications: async (): Promise<NotificationItem[]> => {
    const res = await api.get("/api/notifications");
    return res.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await api.get("/api/notifications/unread-count");
    return res.data;
  },

  markAsRead: async (id: number) => {
    await api.patch(`/api/notifications/${id}/read`);
  },

  markAllAsRead: async () => {
    await api.patch("/api/notifications/read-all");
  },
};
