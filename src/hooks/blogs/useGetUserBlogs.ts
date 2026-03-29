import { getUserBlogsService } from "@/services/client/blogs/blog.service";
import { useState, useCallback } from "react";

export const useGetUserBlogs = () => {
  const [userBlogs, setUserBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const getUserBlogs = useCallback(
    async (userId: string | number, page = 0, isLoadMore = false) => {
      try {
        if (isLoadMore) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
        }

        const response = await getUserBlogsService(userId, page, 5);

        if (isLoadMore) {
          // Spring Boot pagination: response.data.content içinde bloglar var
          const newBlogs = response.content || response;

          setUserBlogs((prev) => {
            // Duplicate kontrolü - id'ye göre filtreleme
            const existingIds = new Set(prev.map((blog) => blog.id));
            const uniqueNewBlogs = newBlogs.filter(
              (blog) => !existingIds.has(blog.id)
            );

            return [...prev, ...uniqueNewBlogs];
          });
        } else {
          setUserBlogs(response.content || response);
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
        console.error("Bloglar çekilirken hata oluştu:", error);
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    []
  );

  const loadMoreUserBlogs = useCallback(
    (userId: string | number) => {
      if (!isLoadingMore && hasMore) {
        getUserBlogs(userId, currentPage + 1, true);
      }
    },
    [currentPage, hasMore, isLoadingMore, getUserBlogs]
  );

  return {
    userBlogs,
    isLoading,
    error,
    getUserBlogs,
    loadMoreUserBlogs,
    isLoadingMore,
    hasMore,
    currentPage,
    totalPages,
  };
};
