"use client";

import { useNotifications } from "@/context/NotificationContext";
import { useRelativeTime } from "@/hooks/useRelativeTime";
import { getFullImageUrl } from "@/utils/image";
import Link from "next/link";

export default function TumBildirimlerPage() {
  const { notifications, markAsRead } = useNotifications();
  const { formatRelativeTime } = useRelativeTime();

  console.log("notifications", notifications);

  if (notifications.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm">
        Hiç bildiriminiz yok.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          onClick={() => !notification.isRead && markAsRead(notification.id)}
          className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
            notification.isRead
              ? "bg-white border-gray-100 text-gray-600"
              : "bg-green-50/40 border-green-100 text-gray-900 font-medium"
          }`}
        >
          <Link href={notification.targetUrl || "#"} className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {!notification.isRead && (
                <span className="w-2 h-2 rounded-full bg-green-600"></span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-7 h-7 rounded-full overflow-hidden">
                <img
                  src={getFullImageUrl(notification.sender?.profileImg)!}
                  alt="Profile Img"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs text-gray-600">{notification.message}</p>
            </div>
          </Link>
          <span className="text-[10px] text-gray-400 whitespace-nowrap">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>
      ))}
    </div>
  );
}
