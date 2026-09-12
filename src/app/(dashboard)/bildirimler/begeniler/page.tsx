"use client";

import { useNotifications } from "@/context/NotificationContext";
import Link from "next/link";

export default function BegenilerBildirimleriPage() {
  const { notifications, markAsRead } = useNotifications();

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
      {likeNotifications.map((n) => (
        <div
          key={n.id}
          onClick={() => !n.isRead && markAsRead(n.id)}
          className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
            n.isRead
              ? "bg-white border-gray-100"
              : "bg-green-50/40 border-green-100 font-medium"
          }`}
        >
          <Link href={n.targetUrl || "#"} className="flex-1">
            <h4 className="text-sm font-semibold mb-1">{n.title}</h4>
            <p className="text-xs text-gray-600">{n.message}</p>
          </Link>
        </div>
      ))}
    </div>
  );
}
