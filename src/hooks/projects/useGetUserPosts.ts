import { getUserPostsService } from "@/services/client/post.service";
import { useState, useCallback } from "react";

export const useGetUserPosts = () => {
  const [userPosts, setUserPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const getUserPosts = useCallback(
    async (username: string, page = 0, isLoadMore = false) => {
      try {
        if (isLoadMore) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
        }

        const response = await getUserPostsService(username, page, 5);

        if (isLoadMore) {
          // Spring Boot pagination: response.data.content içinde postlar var
          const newPosts = response.content || response;

          setUserPosts((prev) => {
            // Duplicate kontrolü - id'ye göre filtreleme
            const existingIds = new Set(prev.map((post) => post.id));
            const uniqueNewPosts = newPosts.filter(
              (post) => !existingIds.has(post.id),
            );

            return [...prev, ...uniqueNewPosts];
          });
        } else {
          setUserPosts(response.content || response);
        }

        // Spring Boot pagination bilgilerini kullan
        if (response.totalPages !== undefined) {
          setTotalPages(response.totalPages);
          setCurrentPage(response.number || page);
          // Son sayfada mıyız kontrol et
          setHasMore(response.number + 1 < response.totalPages);
        } else {
          // Fallback: Eğer Spring pagination bilgisi yoksa
          const contentLength = response.content
            ? response.content.length
            : response.length;
          setHasMore(contentLength === 5);
          setCurrentPage(page);
        }

        setIsLoading(false);
        setIsLoadingMore(false);
      } catch (error) {
        console.error("Postlar çekilirken hata oluştu:", error);
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [],
  );

  const loadMoreUserPosts = useCallback(
    (username: string) => {
      if (!isLoadingMore && hasMore) {
        getUserPosts(username, currentPage + 1, true);
      }
    },
    [currentPage, hasMore, isLoadingMore, getUserPosts],
  );

  return {
    userPosts,
    isLoading,
    error,
    getUserPosts,
    loadMoreUserPosts,
    isLoadingMore,
    hasMore,
    currentPage,
    totalPages,
  };
};
