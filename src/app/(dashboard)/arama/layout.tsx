"use client";

import { useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";

export default function AramaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const query = searchParams?.get("q") || "";

  return (
    <div className="min-h-screen bg-white text-black pt-16 pb-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col gap-6">
      <h1 className="text-4xl text-[#7c7c7c] merriweather-sans font-bold">
        Arama Sonuçları <span className="text-black">&quot;{query}&quot;</span>
      </h1>

      {/* Sekmeler (Tabs) */}
      <div className="flex border-b border-gray-200 gap-8">
        <Link
          href={`/arama/posts?q=${encodeURIComponent(query)}`}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 cursor-pointer ${
            pathname?.includes("/arama/posts")
              ? "border-black text-black"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          Yazılar
        </Link>
        <Link
          href={`/arama/tags?q=${encodeURIComponent(query)}`}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 cursor-pointer ${
            pathname?.includes("/arama/tags")
              ? "border-black text-black"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          Etiketler
        </Link>
        <Link
          href={`/arama/users?q=${encodeURIComponent(query)}`}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 cursor-pointer ${
            pathname?.includes("/arama/users")
              ? "border-black text-black"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          Kişiler
        </Link>
      </div>

      {/* Alt Sayfaların Render Edildiği Alan */}
      <div className="w-full">{children}</div>
    </div>
  );
}
