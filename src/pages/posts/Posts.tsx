"use client";

import { useState } from "react";

import PageAbout from "@/components/PageAbout";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { PostResponse } from "@/services/server/post.service";
import { useGetPosts } from "@/hooks/posts/useGetPosts";
import PostCard from "@/components/projects/PostCard";

interface PostsProps {
  initialPosts: PostResponse[];
  initialPage: number;
  totalPages: number;
}

const Posts = ({ initialPosts, initialPage, totalPages }: PostsProps) => {
  // Aktif filtrenin state'i (undefined = Tümü)
  const [selectedPostType, setSelectedPostType] = useState<string | undefined>(
    undefined,
  );

  // useGetPosts hook'una seçili türü de aktarıyoruz
  const { posts, isLoadingMore, hasMore, loadMorePosts, currentPage } =
    useGetPosts(initialPosts, initialPage, totalPages, selectedPostType);

  // Infinite scroll hook'u
  const loadMoreRef = useInfiniteScroll(loadMorePosts, hasMore, isLoadingMore);

  // Seçilen tipe göre filtrelenmiş yayınlar
  const displayedPosts = selectedPostType
    ? posts.filter((post) => post.postType === selectedPostType)
    : posts;

  return (
    <div className="page">
      <div className="relative flex w-full">
        <div className="relative w-full flex flex-col">
          {/* Üst Bilgi / Duyuru Bandı */}
          {/* <div className="w-full h-12 bg-yellow-500 border-y border-black flex items-center justify-center">
            <p className="text-xs italic">
              <span className="py-1 px-2 bg-white border border-white rounded-lg">
                Welcome Offer
              </span>{" "}
              Access to everything. Now 30% off.{" "}
              <span className="underline font-semibold not-italic">
                Upgrade now
              </span>
            </p>
          </div> */}

          <div className="relative flex w-full">
            {/* SOL ANA AKIŞ */}
            <div className="w-full lg:w-full flex flex-col border-gray-200 lg:border-r pb-5">
              <div className="w-full flex flex-col items-center">
                <div className="max-w-[1000px] z-50 px-6 w-full">
                  {/* Sekme Seçim Başlıkları (PageAbout) */}
                  <div className="w-full flex justify-center">
                    <PageAbout
                      selectedType={selectedPostType}
                      onSelectType={(postType) => setSelectedPostType(postType)}
                    />
                  </div>

                  {/* PROJE / İÇERİK LİSTESİ */}
                  <div className="pt-5 space-y-4">
                    {displayedPosts.length > 0 ? (
                      displayedPosts.map((post) => (
                        <PostCard key={post?.id} post={post} />
                      ))
                    ) : (
                      <div className="py-12 text-center text-xs text-gray-500 border border-dashed border-gray-200 rounded-xl">
                        {selectedPostType
                          ? `${selectedPostType} türünde henüz bir içerik bulunmuyor.`
                          : "Henüz yayınlanmış bir içerik bulunmuyor."}
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
                    Daha fazla içerik yükleniyor...
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
};

export default Posts;
