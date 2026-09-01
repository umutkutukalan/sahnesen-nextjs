"use client";

import { useState } from "react";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { PostResponse } from "@/services/server/post.service";
import PostCard from "@/components/projects/PostCard";
import { useGetCollectionsPosts } from "@/hooks/posts/useGetCollectionsPosts";

interface CollectionsViewProps {
  initialPosts: PostResponse[];
  initialPage: number;
  totalPages: number;
}

export default function CollectionsView({
  initialPosts,
  initialPage,
  totalPages,
}: CollectionsViewProps) {
  // Aktif sekme state'i: "liked" veya "bookmarked"
  const [activeTab, setActiveTab] = useState<"liked" | "bookmarked">("liked");

  const {
    posts,
    isLoadingMore,
    hasMore,
    loadMorePosts,
    currentPage,
    fetchPostsByType,
  } = useGetCollectionsPosts(initialPosts, initialPage, totalPages);

  // Sekme değiştirme fonksiyonu
  const handleTabChange = (tab: "liked" | "bookmarked") => {
    if (activeTab === tab) return;
    setActiveTab(tab);
    fetchPostsByType(tab);
  };

  // Sonsuz kaydırma tetikleyicisi için aktif sekmeyi hook'a argüman olarak geçiyoruz
  const loadMoreRef = useInfiniteScroll(
    () => loadMorePosts(activeTab),
    hasMore,
    isLoadingMore,
  );

  return (
    <div className="page w-full">
      <div className="relative flex w-full">
        <div className="relative w-full flex flex-col">
          <div className="relative flex w-full">
            <div className="w-full flex flex-col border-gray-200 lg:border-r pb-5">
              <div className="w-full flex flex-col items-center">
                <div className="max-w-[1000px] z-50 px-6 w-full">
                  {/* Sekme Butonları (Beğenilenler / Kaydedilenler) */}
                  <div className="flex justify-center space-x-4 border-b border-gray-200 py-4 mb-6">
                    <button
                      onClick={() => handleTabChange("liked")}
                      className={`pb-2 text-sm font-medium transition-colors border-b-2 cursor-pointer ${
                        activeTab === "liked"
                          ? "border-black text-black"
                          : "border-transparent text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      Beğenilenler
                    </button>
                    <button
                      onClick={() => handleTabChange("bookmarked")}
                      className={`pb-2 text-sm font-medium transition-colors border-b-2 cursor-pointer ${
                        activeTab === "bookmarked"
                          ? "border-black text-black"
                          : "border-transparent text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      Kaydedilenler
                    </button>
                  </div>

                  {/* PROJE / İÇERİK LİSTESİ */}
                  <div className="pt-2 space-y-4">
                    {posts.length > 0 ? (
                      posts.map((post) => (
                        <PostCard key={post?.id} post={post} />
                      ))
                    ) : (
                      <div className="py-12 text-center text-xs text-gray-500 border border-dashed border-gray-200 rounded-xl">
                        {activeTab === "liked"
                          ? "Henüz beğendiğin bir içerik bulunmuyor."
                          : "Henüz kaydettiğin bir içerik bulunmuyor."}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Infinite Scroll Tetikleyici Ref */}
              {hasMore && <div ref={loadMoreRef}></div>}

              {/* YÜKLENİYOR İNDİKATÖRÜ */}
              {isLoadingMore && (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
                  <span className="ml-3 text-gray-600 text-xs">
                    İçerikler yükleniyor...
                  </span>
                </div>
              )}

              {/* TÜM İÇERİKLER YÜKLENDİ MESAJI */}
              {!hasMore && posts.length > 0 && (
                <div className="py-8 text-center text-xs text-gray-500">
                  Tüm içerikler yüklendi.
                </div>
              )}

              {/* SAYFA BİLGİSİ */}
              {totalPages > 1 && (
                <div className="py-4 text-center text-sm text-gray-400">
                  Sayfa {currentPage + 1} / {totalPages} • {posts.length} içerik
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
