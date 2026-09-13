"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNotifications } from "@/context/NotificationContext";

export default function BildirimlerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { markAllAsRead, unreadCount, notifications } = useNotifications();

  // 🔢 Okunmamışları kendi kategorilerine göre hesaplayalım
  const unreadFollowCount = notifications.filter(
    (n) =>
      !n.isRead && (n.type === "FOLLOW" || n.type === "FOLLOWED_USER_POST"),
  ).length;

  const unreadLikeCount = notifications.filter(
    (n) => !n.isRead && n.type === "POST_LIKE",
  ).length;

  const tabs = [
    { name: "Tümü", href: "/bildirimler", count: unreadCount },
    { name: "Takip", href: "/bildirimler/takip", count: unreadFollowCount },
    {
      name: "Beğeniler",
      href: "/bildirimler/begeniler",
      count: unreadLikeCount,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-black pt-16 pb-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col gap-6">
      {/* Üst Başlık ve Toplu Okundu Butonu */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl text-[#7c7c7c] merriweather-sans font-bold">
          Bildirimler
        </h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs text-green-700 hover:text-green-800 font-medium transition-colors cursor-pointer bg-green-50 px-3 py-1.5 rounded-lg border border-green-200"
          >
            Tümünü okundu işaretle
          </button>
        )}
      </div>

      {/* Sekmeler (Tabs) */}
      <div className="flex border-b border-gray-200 gap-8">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`pb-3 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                isActive
                  ? "text-black border-b-2 border-black -mb-[1px]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <span>{tab.name}</span>
              {tab.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                    isActive
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Aktif Sekme İçeriği */}
      <div>{children}</div>
    </div>
  );
}
