import { getUserPostsService } from "@/services/client/post.service";
import { PostResponse } from "@/services/server/post.service";
import { useEffect, useState } from "react";

export const useGetUserPosts = (
  initialPosts: PostResponse[] = [],
  initialPage: number = 0,
  initialTotalPages: number = 0,
  username?: string,
) => {
  const [userPosts, setUserPosts] = useState<PostResponse[]>(
    initialPosts || [],
  );
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [hasMore, setHasMore] = useState(initialPage + 1 < initialTotalPages);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Initial veriler veya prop'lar değiştikçe state'leri senkronize et
  useEffect(() => {
    if (initialPosts) setUserPosts(initialPosts);
    setCurrentPage(initialPage);
    setTotalPages(initialTotalPages);
    setHasMore(initialPage + 1 < initialTotalPages);
  }, [initialPosts, initialPage, initialTotalPages]);

  const loadMoreUserPosts = async () => {
    if (isLoadingMore || !hasMore || !username) return;

    setIsLoadingMore(true);

    try {
      const nextPage = currentPage + 1;
      const response = await getUserPostsService(username, nextPage, 5);

      // 🔑 KRİTİK DÜZELTME: Spring Boot Page yapısını esnek şekilde çözümlüyoruz
      // Yanıt 'response.content' de gelebilir, direkt 'response' (array/page) de olabilir.
      const newPosts: PostResponse[] =
        response?.content || (Array.isArray(response) ? response : []);
      const pageNum = response?.number ?? nextPage;
      const totalPageCount = response?.totalPages ?? totalPages;

      if (newPosts.length > 0) {
        setUserPosts((prev) => {
          const existingIds = new Set(prev.map((post) => post.id));
          const uniqueNewPosts = newPosts.filter(
            (post) => !existingIds.has(post.id),
          );
          return [...prev, ...uniqueNewPosts];
        });

        setCurrentPage(pageNum);
        setTotalPages(totalPageCount);
        setHasMore(pageNum + 1 < totalPageCount);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Kullanıcı gönderileri yüklenirken hata:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return {
    userPosts,
    loadMoreUserPosts,
    isLoadingMore,
    hasMore,
    currentPage,
    totalPages,
  };
};
