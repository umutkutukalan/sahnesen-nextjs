"use client";

import React from "react";
import { useAuth } from "@/context/UserContext";
import Sidebar from "@/components/sidebar/Sidebar";
import ProfileSidebar from "@/components/sidebar/ProfileSidebar";
import Navbar from "@/components/navbar/Navbar";
import { usePathname } from "next/navigation";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isLoggingOut } = useAuth();
  const pathname = usePathname();

  // İlk yüklenme veya çıkış yapma sürecindeyse şık bir tam ekran yükleme göster
  if (loading || isLoggingOut) {
    return (
      <div className="flex flex-col gap-3 h-screen w-screen items-center justify-center bg-[#F7F4EA] text-black z-[99999] fixed inset-0">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="text-xs font-medium text-gray-600 tracking-wide">
          {isLoggingOut ? "Çıkış yapılıyor..." : "Yükleniyor..."}
        </p>
      </div>
    );
  }

  // Kullanıcı yoksa doğrudan alt bileşenleri (Landing / Home sayfası) göster
  if (!user) {
    return <>{children}</>;
  }

  const isEditorPage = pathname?.startsWith("/olustur");
  if (isEditorPage) {
    return <>{children}</>;
  }

  const isProfilePage = pathname?.startsWith("/profil");

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Sabit Navbar */}
      <Navbar transparent={false} isProfile={isProfilePage} />

      {/* Alt Alan (Sidebar + Sayfa İçeriği) */}
      <div className="flex flex-1 min-h-[calc(100vh-64px)]">
        {/* Masaüstü Sabit Sidebar */}
        <div className="hidden lg:block">
          {isProfilePage ? <ProfileSidebar /> : <Sidebar />}
        </div>

        {/* Mobil Drawer Sidebar */}
        <div className="block lg:hidden">
          <ProfileSidebar />
        </div>

        {/* Sayfa Değiştikçe Sadece Burası Yenilenir, Navbar ve Sidebar Sabit Kalır */}
        <main className="flex-1 min-w-0 bg-white">{children}</main>
      </div>
    </div>
  );
}
