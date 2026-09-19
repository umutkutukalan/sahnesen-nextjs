"use client";

import { useNotifications } from "@/context/NotificationContext";
import { useFollow } from "@/hooks/follow/useFollow";
import { useRelativeTime } from "@/hooks/useRelativeTime";
import { getFullImageUrl } from "@/utils/image";
import { useToProfile } from "@/utils/useToProfile";
import Link from "next/link";
import { SlBadge } from "react-icons/sl";
import { IoHeartSharp } from "react-icons/io5";
import { TbArrowBadgeRightFilled } from "react-icons/tb";

// Satır bazlı takip butonunu yönetmek için küçük bir yardımcı bileşen:
export function FollowButton({
  username,
  initialIsFollowing,
}: {
  username: string;
  initialIsFollowing: boolean;
}) {
  const { isFollowing, toggleFollow, followLoading } = useFollow(
    username,
    initialIsFollowing, // artık ikinci parametre
  );

  const followingStatus = isFollowing; // artık initialIsFollowing ile OR'lamaya gerek yok, hook zaten onunla başlıyor

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleFollow();
      }}
      disabled={followLoading}
      className={`px-3 py-1 mr-2 flex items-center justify-center gap-1 rounded-lg text-[10px] md:text-xs cursor-pointer transition-colors ${
        followingStatus
          ? "bg-green-800 hover:bg-green-700 text-white"
          : "bg-blue-800 hover:bg-blue-700 text-white"
      } ${followLoading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {followLoading ? (
        <span>Yükleniyor...</span>
      ) : followingStatus ? (
        <span>Takiptesin</span>
      ) : (
        <span>Takip Et</span>
      )}
    </button>
  );
}

export default function TumBildirimlerPage() {
  const { notifications, markAsRead, notificationLoading } = useNotifications();
  const { formatRelativeTime } = useRelativeTime();
  const { ToProfile } = useToProfile();

  if (notificationLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-white">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
        <span className="text-sm text-gray-500">Bildirimler yükleniyor...</span>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-xs md:text-sm text-gray-500">
        Hiç bildiriminiz yok.
      </div>
    );
  }

  console.log(notifications);

  return (
    <div className="flex flex-col gap-3">
      {notifications.map((notification) => (
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
                {!notification.isRead && notification.type === "POST_LIKE" && (
                  <span className="absolute top-0 w-3.5 h-3.5 left-0 z-10">
                    <IoHeartSharp className="w-full h-full text-red-600" />
                  </span>
                )}
                {!notification.isRead && notification.type === "FOLLOW" && (
                  <span className="absolute top-0 left-0.5 w-2.5 h-2.5 rounded-full bg-green-600 z-10"></span>
                )}
                {notification.sender ? (
                  <div className="relative w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
                    <img
                      src={getFullImageUrl(notification.sender?.profileImg)!}
                      alt="Profile Img"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="relative w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
                    <TbArrowBadgeRightFilled className="text-2xl" />
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <p
                  onClick={(e) => {
                    e.stopPropagation();
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
