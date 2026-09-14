"use client";

import { useNotifications } from "@/context/NotificationContext";
import { useRelativeTime } from "@/hooks/useRelativeTime";
import { getFullImageUrl } from "@/utils/image";
import Link from "next/link";

export default function TakipBildirimleriPage() {
  const { notifications, markAsRead } = useNotifications();
  const { formatRelativeTime } = useRelativeTime();

  // Sadece FOLLOW ve FOLLOWED_USER_POST türündekileri filtrele
  const followNotifications = notifications.filter(
    (n) => n.type === "FOLLOW" || n.type === "FOLLOWED_USER_POST",
  );

  if (followNotifications.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm">
        Takip bildiriminiz bulunmuyor.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {followNotifications.map((notification) => (
        <div
          key={notification.id}
          onClick={() => !notification.isRead && markAsRead(notification.id)}
          className={`py-1 transition-all flex items-start justify-between gap-4 ${
            notification.isRead
              ? "bg-white text-gray-600"
              : notification.type === "FOLLOW"
                ? "bg-green-50 text-gray-900 font-medium"
                : ""
          }`}
        >
          <Link href={notification.targetUrl || "#"} className="flex-1">
            <div className="flex items-center gap-2">
              <div className="relative">
                {!notification.isRead && notification.type === "FOLLOW" && (
                  <span className="absolute top-0 left-0.5 w-2.5 h-2.5 rounded-full bg-green-600 z-10"></span>
                )}
                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                  <img
                    src={getFullImageUrl(notification.sender?.profileImg)!}
                    alt="Profile Img"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <p className="text-[11px] md:text-xs text-gray-800">
                  <span className="text-black font-semibold">
                    {notification.sender?.name} {notification.sender?.surname}
                  </span>
                  {`, `}
                  {notification.message}
                </p>
                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                  {formatRelativeTime(notification.createdAt)}
                </span>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
