"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import CreateIntroTwo from "@/pages/create/CreateIntroTwo";
import CreateProjectsBlogs from "@/pages/create/CreateProjectsBlogs";

function CreateContent() {
  const searchParams = useSearchParams();
  const type = searchParams?.get("type");
  const slug = searchParams?.get("slug");

  // Eğer URL'de bir type veya slug varsa, doğrudan editör bileşenini göster
  if (type || slug) {
    return <CreateProjectsBlogs />;
  }

  // Yoksa kartların bulunduğu giriş ekranını göster
  return <CreateIntroTwo />;
}

export default function CreatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white text-black font-semibold">
          Yükleniyor...
        </div>
      }
    >
      <CreateContent />
    </Suspense>
  );
}
