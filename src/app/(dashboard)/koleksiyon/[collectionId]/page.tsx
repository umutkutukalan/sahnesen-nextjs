"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import PostCard from "@/components/projects/PostCard";
import { getCollectionPostsClient } from "@/services/client/collection/collection.service";
import { PostResponse } from "@/services/server/post.service";
import { useParams } from "next/navigation";

export default function CollectionDetailPage() {
  const params = useParams();
  const collectionId = Number(params?.collectionId);

  const [collectionPosts, setCollectionPosts] = useState<PostResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const observerRef = useRef<HTMLDivElement | null>(null);

  // İlk yükleme
  const fetchPosts = useCallback(async () => {
    if (!collectionId || isNaN(collectionId)) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await getCollectionPostsClient(collectionId, 0, 6);
      const posts = Array.isArray(data) ? data : data?.content || [];
      setCollectionPosts(posts);
      setHasMore(!data.last && posts.length > 0);
    } catch (error) {
      console.error("Koleksiyon içerikleri alınamadı:", error);
    } finally {
      setIsLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Sonsuz kaydırma ile sonraki sayfaları çekme
  const loadMorePosts = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data = await getCollectionPostsClient(collectionId, nextPage, 6);
      const newPosts = Array.isArray(data) ? data : data?.content || [];

      setCollectionPosts((prev) => [...prev, ...newPosts]);
      setPage(nextPage);
      setHasMore(!data.last && newPosts.length > 0);
    } catch (error) {
      console.error("Daha fazla içerik yüklenemedi:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Intersection Observer ile sonsuz kaydırma tetikleyicisi
  useEffect(() => {
    const currentObserverRef = observerRef.current;
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

    if (currentObserverRef) {
      observer.observe(currentObserverRef);
    }

    return () => {
      if (currentObserverRef) {
        observer.unobserve(currentObserverRef);
      }
    };
  }, [hasMore, isLoading, isLoadingMore, loadMorePosts]);

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex flex-col gap-6">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-gray-400">
            İçerikler yükleniyor...
          </div>
        ) : collectionPosts.length > 0 ? (
          <div className="grid grid-cols-1">
            {collectionPosts.map((post) => (
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
            Bu koleksiyonda henüz hiç sahne bulunmuyor.
          </p>
        )}
      </div>
    </div>
  );
}
