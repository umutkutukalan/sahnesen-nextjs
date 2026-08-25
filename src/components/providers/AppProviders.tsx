"use client";

import React from "react";
import { UserProvider, useAuth } from "@/context/UserContext";
import { SidebarProvider } from "@/context/SidebarContext";
import Sidebar from "@/components/sidebar/Sidebar";
import ProfileSidebar from "@/components/sidebar/ProfileSidebar"; // Yolu kontrol et
import Navbar from "@/components/navbar/Navbar";
import { usePathname } from "next/navigation";

function AppContent({ children }: { children: React.ReactNode }) {
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
    <>
      <Navbar transparent={false} isProfile={isProfilePage} />
      <div className="flex min-h-screen">
        {/* 
          1. Masaüstünde (lg ve üzeri): Profil sayfasında değilsek Ana Sidebar görünür.
          2. Mobilde (lg altı): CSS/Tailwind ile gizlenip ProfileSidebar drawer yapısı devreye sokulabilir.
        */}
        <div className="hidden lg:block">
          {isProfilePage ? <ProfileSidebar /> : <Sidebar />}
        </div>

        {/* Mobil Ekranlar İçin Ortak Drawer Olarak ProfileSidebar */}
        <div className="block lg:hidden">
          <ProfileSidebar />
        </div>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </>
  );
}

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <SidebarProvider>
        <AppContent>{children}</AppContent>
      </SidebarProvider>
    </UserProvider>
  );
}
