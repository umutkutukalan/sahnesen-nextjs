"use client";

import { useNotifications } from "@/context/NotificationContext";
import { useRelativeTime } from "@/hooks/useRelativeTime";
import { getFullImageUrl } from "@/utils/image";
import { useToProfile } from "@/utils/useToProfile";
import Link from "next/link";
import { IoHeartSharp } from "react-icons/io5";

export default function BegenilerBildirimleriPage() {
  const { notifications, markAsRead } = useNotifications();
  const { formatRelativeTime } = useRelativeTime();
  const { ToProfile } = useToProfile();

  // Sadece POST_LIKE türündekileri filtrele
  const likeNotifications = notifications.filter((n) => n.type === "POST_LIKE");

  if (likeNotifications.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm">
        Beğeni bildiriminiz bulunmuyor.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {likeNotifications.map((notification) => (
        <div
          key={notification.id}
          onClick={() => !notification.isRead && markAsRead(notification.id)}
          className={`transition-colors duration-300 flex items-center justify-between gap-4 ${
            notification.isRead
              ? "bg-white"
              : notification.type === "POST_LIKE"
                ? "border-l-3 border-red-600"
                : ""
          }`}
        >
          <Link href={notification.targetUrl || "#"} className="flex-1">
            <div className="px-3 py-1 flex items-center gap-2">
              <div className="relative">
                {!notification.isRead && notification.type === "POST_LIKE" && (
                  <span className="absolute top-0 w-3.5 h-3.5 left-0 z-10">
                    <IoHeartSharp className="w-full h-full text-red-600" />
                  </span>
                )}
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
                <p
                  onClick={(e) => {
                    if (notification.sender?.username) {
                      ToProfile(notification.sender.username);
                    }
                  }}
                  className="text-[11px] md:text-xs text-gray-800"
                >
                  <span className="text-black font-semibold hover:underline">
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
