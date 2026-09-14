"use client";

import { useNotifications } from "@/context/NotificationContext";
import { useRelativeTime } from "@/hooks/useRelativeTime";
import { getFullImageUrl } from "@/utils/image";
import { useToProfile } from "@/utils/useToProfile";
import Link from "next/link";
import { FollowButton } from "../page";

export default function TakipBildirimleriPage() {
  const { notifications, markAsRead, notificationLoading } = useNotifications();
  const { formatRelativeTime } = useRelativeTime();

  const { ToProfile } = useToProfile();

  // Sadece FOLLOW ve FOLLOWED_USER_POST türündekileri filtrele
  const followNotifications = notifications.filter(
    (n) => n.type === "FOLLOW" || n.type === "FOLLOWED_USER_POST",
  );

  if (notificationLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-white">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
        <span className="text-sm text-gray-500">Bildirimler yükleniyor...</span>
      </div>
    );
  }

  if (followNotifications.length === 0) {
    return (
      <div className="text-xs md:text-sm text-gray-500">
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
          className={`transition-colors duration-300 flex items-center justify-between gap-4 ${
            notification.isRead
              ? "bg-white"
              : notification.type === "POST_LIKE"
                ? "border-l-3 border-red-600"
                : notification.type === "FOLLOW"
                  ? "border-l-3 border-green-600"
                  : ""
          }`}
        >
          <Link href={notification.targetUrl || "#"} className="flex-1">
            <div className="px-3 py-1 flex items-center gap-2">
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
          {notification.type === "FOLLOW" && notification.sender?.username && (
            <FollowButton
              username={notification.sender.username}
              initialIsFollowing={notification.sender.isFollowing!}
            />
          )}
        </div>
      ))}
    </div>
  );
}
