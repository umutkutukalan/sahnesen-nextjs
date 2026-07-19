"use client";

import React from "react";
import { UserProvider } from "@/context/UserContext"; // Kendi context hook adın neyse (useUser veya useAuth)
import { SidebarProvider } from "@/context/SidebarContext";
import Sidebar from "@/components/sidebar/Sidebar";
import Navbar from "@/components/navbar/Navbar";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/UserContext";

function AppContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth(); // useAuth veya useUser hangisini kullanıyorsan
  const pathname = usePathname();

  // Yüklenme durumu
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-neutral-950 text-white">
        <p className="animate-pulse text-sm">Yükleniyor...</p>
      </div>
    );
  }

  // Giriş yapılmadıysa kabuksuz direkt login alanını göster
  if (!user) {
    return <>{children}</>;
  }

  // Editör sayfası kontrolü
  const isEditorPage = pathname?.startsWith("/olustur");
  if (isEditorPage) {
    return <>{children}</>;
  }

  // Giriş yapılmış ve ana akış görünümü
  return (
    <>
      <Navbar transparent={false} isProfile={false} />
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </>
  );
}

// Dışarıya açacağımız tek kapsayıcı
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
