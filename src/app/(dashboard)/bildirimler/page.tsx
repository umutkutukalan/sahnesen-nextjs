"use client";

import { useNotifications } from "@/context/NotificationContext";
import Link from "next/link";

export default function TumBildirimlerPage() {
  const { notifications, markAsRead } = useNotifications();

  if (notifications.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm">
        Hiç bildiriminiz yok.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {notifications.map((n) => (
        <div
          key={n.id}
          onClick={() => !n.isRead && markAsRead(n.id)}
          className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
            n.isRead
              ? "bg-white border-gray-100 text-gray-600"
              : "bg-green-50/40 border-green-100 text-gray-900 font-medium"
          }`}
        >
          <Link href={n.targetUrl || "#"} className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-semibold">{n.title}</h4>
              {!n.isRead && (
                <span className="w-2 h-2 rounded-full bg-green-600"></span>
              )}
            </div>
            <p className="text-xs text-gray-600">{n.message}</p>
          </Link>
          <span className="text-[10px] text-gray-400 whitespace-nowrap">
            {new Date(n.createdAt).toLocaleDateString("tr-TR", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      ))}
    </div>
  );
}
