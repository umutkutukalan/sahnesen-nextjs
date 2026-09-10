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
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-neutral-950 text-white">
        <p className="animate-pulse text-sm">Yükleniyor...</p>
      </div>
    );
  }

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
