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
  const { markAllAsRead, unreadCount } = useNotifications();

  const tabs = [
    { name: "Tümü", href: "/bildirimler" },
    { name: "Takip", href: "/bildirimler/takip" },
    { name: "Beğeniler", href: "/bildirimler/begeniler" },
  ];

  return (
    <div className="max-w-2xl mx-auto pt-28 px-4 pb-12">
      {/* Üst Başlık ve Toplu Okundu Butonu */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-serif text-gray-900">
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
      <div className="flex border-b border-gray-200 mb-6 gap-6">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                isActive
                  ? "text-black border-b-2 border-black -mb-[1px]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.name}
            </Link>
          );
        })}
      </div>

      {/* Aktif Sekme İçeriği */}
      <div>{children}</div>
    </div>
  );
}
