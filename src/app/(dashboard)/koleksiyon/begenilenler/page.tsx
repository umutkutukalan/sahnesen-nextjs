"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import PostCard from "@/components/projects/PostCard";
import { interactionService } from "@/services/client/interaction/interaction.service";
import { PostResponse } from "@/services/server/post.service";
import { useSearchParams } from "next/navigation";

export default function BegenilenlerPage() {
  const searchParams = useSearchParams();

  // URL'deki ?type= parametresini alıyoruz (Layout ile uyumlu çalışması için)
  const selectedType = searchParams?.get("type") || undefined;

  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const observerRef = useRef<HTMLDivElement | null>(null);

  // Beğenilen postları ilk yükleme veya filtre değişiminde çekme
  const fetchLikedPosts = useCallback(
    async (type?: string, pageNum = 0, append = false) => {
      if (pageNum === 0) setIsLoading(true);
      else setIsLoadingMore(true);

      try {
        const data = await interactionService.getLikedPosts(type, pageNum, 6);
        const newPosts = Array.isArray(data) ? data : data?.content || [];

        setPosts((prev) => (append ? [...prev, ...newPosts] : newPosts));
        setPage(pageNum);
        setHasMore(!data.last && newPosts.length > 0);
      } catch (error) {
        console.error("Beğenilen içerikler alınamadı:", error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [],
  );

  // Tür (type) değiştiğinde veya ilk açılışta tetikle
  useEffect(() => {
    fetchLikedPosts(selectedType, 0, false);
  }, [selectedType, fetchLikedPosts]);

  // Sonsuz kaydırma (Load More) tetikleyicisi
  const loadMorePosts = useCallback(() => {
    if (isLoadingMore || !hasMore || isLoading) return;
    fetchLikedPosts(selectedType, page + 1, true);
  }, [isLoadingMore, hasMore, isLoading, selectedType, page, fetchLikedPosts]);

  // Intersection Observer
  useEffect(() => {
    const currentRef = observerRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !isLoading &&
          !isLoadingMore
        ) {
          loadMorePosts();
        }
      },
      { threshold: 1.0 },
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, isLoading, isLoadingMore, loadMorePosts]);

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex flex-col gap-6">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-gray-400">
            Beğenilenler yükleniyor...
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1">
            {posts.map((post) => (
              <PostCard key={post?.id} post={post} />
            ))}

            {/* Sonsuz kaydırma gözlem noktası */}
            <div ref={observerRef} className="h-4 w-full" />

            {isLoadingMore && (
              <div className="py-4 text-center text-xs text-gray-400">
                Daha fazla yükleniyor...
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-xs">
            Henüz beğendiğin bir sahne bulunmuyor.
          </p>
        )}
      </div>
    </div>
  );
}
