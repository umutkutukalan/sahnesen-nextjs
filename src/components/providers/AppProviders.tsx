"use client";

import React from "react";
import { useAuth } from "@/context/UserContext";
import Sidebar from "@/components/sidebar/Sidebar";
import ProfileSidebar from "@/components/sidebar/ProfileSidebar";
import Navbar from "@/components/navbar/Navbar";
import { usePathname, useRouter } from "next/navigation";
import LoginPage from "@/pages/LoginPage";
import { useSidebar } from "@/context/SidebarContext";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isLoggingOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { isSidebarOpen, isProfileSidebarOpen } = useSidebar();

  // açık/misafirlerin de gezebileceği sayfaların kontrolü:
  // 1. Ana sayfa ("/")
  // 2. Arama sayfaları ("/arama...")
  // 3. Etiket sayfaları ("/tag...")
  // 4. Kullanıcı profilleri veya yazı detayları (Genellikle 2 segmentli yollar: /username/slug veya /profil/...)
  const segments = pathname?.split("/").filter(Boolean) || [];

  const isHome = pathname === "/";
  const isSearchPage = pathname?.startsWith("/arama");
  const isTagPage = pathname?.startsWith("/tag");
  const isProfileRoute = pathname?.startsWith("/profil");

  // Eğer URL'de 2 parça varsa (örn: /kutukalanumut/sirket-maili-...) bu bir yazı detay veya yazar sayfasıdır
  const isDetailOrAuthorPage = segments.length === 2 && !isProfileRoute;

  // Misafir kullanıcılar için serbest olan sayfalar
  const isPublicAllowedPage =
    isHome ||
    isSearchPage ||
    isTagPage ||
    isProfileRoute ||
    isDetailOrAuthorPage;

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

  if (!user) {
    // Eğer ana sayfadaysak Navbar olmadan veya isteğe göre sadece children göster
    if (isHome) {
      return <>{children}</>;
    }

    // Ana sayfa dışındaki serbest/açık sayfalarda Navbar göstererek içeriği ver
    return (
      <>
        {!isPublicAllowedPage ? (
          <div className="min-h-screen flex flex-col items-center justify-center bg-[#f6f4ea]">
            <div className="w-full h-full flex items-center justify-center">
              <LoginPage setShowLoginModal={() => router.push("/")} />
            </div>
          </div>
        ) : (
          <>
            <Navbar transparent={false} />
            <div className="min-h-screen flex flex-col bg-white">
              <div className="flex flex-1 min-h-[calc(100vh-64px)]">
                <main
                  className={`flex-1 min-w-0 bg-white relative top-[64px] transition-all duration-500 ease-in-out`}
                >
                  {children}
                </main>
              </div>
            </div>
          </>
        )}
      </>
    );
  }

  const isEditorPage = pathname?.startsWith("/olustur");
  if (isEditorPage) {
    return <>{children}</>;
  }

  const isProfilePage = pathname?.startsWith("/profil");

  return (
    <>
      {/* Sabit Navbar */}
      <Navbar transparent={false} isProfile={isProfilePage} />
      <div className="min-h-screen flex flex-col bg-white">
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
          <main
            className={`flex-1 min-w-0 bg-white relative top-[64px] transition-all duration-500 ease-in-out ${
              isProfilePage
                ? isProfileSidebarOpen
                  ? ""
                  : ""
                : isSidebarOpen
                  ? "lg:ml-60"
                  : ""
            }`}
          >
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
