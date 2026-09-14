"use client";

import { useNotifications } from "@/context/NotificationContext";
import { useAuth } from "@/context/UserContext";
import { useFollow } from "@/hooks/follow/useFollow";
import { useGetFollowers } from "@/hooks/follow/useGetFollowers";
import { useGetFollowing } from "@/hooks/follow/useGetFollowing";
import { useGetUser } from "@/hooks/user/useGetUser";
import { useRelativeTime } from "@/hooks/useRelativeTime";
import { getFullImageUrl } from "@/utils/image";
import { useToProfile } from "@/utils/useToProfile";
import Link from "next/link";
import { useEffect } from "react";

export default function TakipBildirimleriPage() {
  const { user } = useAuth();
  const { notifications, markAsRead } = useNotifications();
  const { formatRelativeTime } = useRelativeTime();

  const { ToProfile } = useToProfile();

  // Sadece FOLLOW ve FOLLOWED_USER_POST türündekileri filtrele
  const followNotifications = notifications.filter(
    (n) => n.type === "FOLLOW" || n.type === "FOLLOWED_USER_POST",
  );

  const targetUsername = notifications.find(
    (notification) => notification.type === "FOLLOW",
  )?.sender?.username;
  const usernameSlug = user?.slug;

  const { getFollowing } = useGetFollowing();

  const { getFollowers } = useGetFollowers();
  const { isFollowing, toggleFollow } = useFollow(targetUsername!, () => {
    if (targetUsername) {
      getFollowing(targetUsername, true);
      getFollowers(targetUsername, true);
    }
  });

  const { getUser, isLoading } = useGetUser();

  useEffect(() => {
    if (usernameSlug) {
      getUser(usernameSlug);
    }
  }, [usernameSlug, getUser]);

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
          {notification.type === "FOLLOW" && (
            <button
              onClick={toggleFollow}
              disabled={isLoading}
              className={`px-2 py-1 mr-2 flex items-center justify-center gap-1 border border-gray-300 rounded-full text-[10px] md:text-xs cursor-pointer transition-colors hover:bg-gray-50 disabled:opacity-50 ${
                isFollowing
                  ? "bg-white text-green-600"
                  : "bg-white text-green-700 border-gray-300"
              }`}
            >
              {isFollowing ? (
                <span>Takip Ediliyor</span>
              ) : (
                <span>Takip Et</span>
              )}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
