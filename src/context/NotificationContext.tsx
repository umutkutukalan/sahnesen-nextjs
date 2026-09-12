"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import {
  notificationService,
  NotificationItem,
} from "@/services/client/notification/notification.service";
import { useAuth } from "@/context/UserContext";

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refetchNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchInitialData = useCallback(async () => {
    if (!user) return;
    try {
      const [notifsData, countData] = await Promise.all([
        notificationService.getNotifications(),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(notifsData);
      setUnreadCount(countData);
    } catch (error) {
      console.error("Bildirimler yüklenemedi:", error);
    }
  }, [user]);

  console.log("notification user.id", user?.id);

  useEffect(() => {
    if (user) {
      fetchInitialData();

      // WebSocket / SockJS Bağlantısı
      // Backend'deki endpoint'ine göre URL'i ayarlayabilirsin (örn: http://localhost:8080/ws-sahnesen)
      const socketUrl =
        process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8080/ws-sahnesen";

      const stompClient = new Client({
        webSocketFactory: () => new SockJS(socketUrl),
        debug: (str) => {
          console.log("STOMP: ", str); // Burada bağlantı ve abonelik loglarını göreceksin
        },
        reconnectDelay: 5000,
        onConnect: () => {
          // Backend'de tanımladığın kanal: /topic/notifications/{userId}
          stompClient.subscribe(
            `/topic/notifications/${user.id}`,
            (message) => {
              console.log("Gelen Canlı Bildirim:", message.body);
              const newNotif: NotificationItem = JSON.parse(message.body);

              // Eğer gelen özel bir READ_ALL sinyaliyse sayaçları sıfırla
              if (newNotif.message === "READ_ALL") {
                setNotifications((prev) =>
                  prev.map((n) => ({ ...n, isRead: true })),
                );
                setUnreadCount(0);
                return;
              }

              // Normal yeni bildirim
              setNotifications((prev) => [newNotif, ...prev]);
              setUnreadCount((prev) => prev + 1);
            },
          );
        },
      });

      stompClient.activate();

      return () => {
        stompClient.deactivate();
      };
    }
  }, [user, fetchInitialData]);

  const markAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Bildirim okundu işaretlenemedi:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Tüm bildirimler okundu işaretlenemedi:", error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        refetchNotifications: fetchInitialData,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
};
