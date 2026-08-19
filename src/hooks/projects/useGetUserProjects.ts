import { getUserPostsService } from "@/services/client/post.service";
import { useState, useCallback } from "react";

export const useGetUserProjects = () => {
  const [userProjects, setUserProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const getUserProjects = useCallback(
    async (username: string, page = 0, isLoadMore = false) => {
      try {
        if (isLoadMore) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
        }

        const response = await getUserPostsService(username, page, 5);

        if (isLoadMore) {
          // Spring Boot pagination: response.data.content içinde projeler var
          const newProjects = response.content || response;

          setUserProjects((prev) => {
            // Duplicate kontrolü - id'ye göre filtreleme
            const existingIds = new Set(prev.map((project) => project.id));
            const uniqueNewProjects = newProjects.filter(
              (project) => !existingIds.has(project.id),
            );

            return [...prev, ...uniqueNewProjects];
          });
        } else {
          setUserProjects(response.content || response);
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
        console.error("Projeler çekilirken hata oluştu:", error);
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [],
  );

  const loadMoreUserProjects = useCallback(
    (userId: string | number) => {
      if (!isLoadingMore && hasMore) {
        getUserProjects(userId, currentPage + 1, true);
      }
    },
    [currentPage, hasMore, isLoadingMore, getUserProjects],
  );

  return {
    userProjects,
    isLoading,
    error,
    getUserProjects,
    loadMoreUserProjects,
    isLoadingMore,
    hasMore,
    currentPage,
    totalPages,
  };
};
