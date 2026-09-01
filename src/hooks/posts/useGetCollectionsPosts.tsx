import { useState } from "react";
import { PostResponse } from "@/services/server/post.service";
import { interactionService } from "@/services/client/interaction/interaction.service";

export function useGetCollectionsPosts(
  initialPosts: PostResponse[],
  initialPage: number,
  initialTotalPages: number,
) {
  const [posts, setPosts] = useState<PostResponse[]>(initialPosts);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(initialTotalPages);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(
    initialPage + 1 < initialTotalPages,
  );

  // Sekme değiştiğinde (liked veya bookmarked) sıfırdan veri çekme
  const fetchPostsByType = async (
    activeTab: "liked" | "bookmarked",
    postType?: string,
  ) => {
    try {
      setIsLoadingMore(true);
      let data;
      if (activeTab === "liked") {
        data = await interactionService.getLikedPosts(0, 5);
      } else {
        data = await interactionService.getBookmarkedPosts(postType, 0, 5);
      }

      const content = data?.content || [];
      const pageNumber = data?.number ?? 0;
      const pagesTotal = data?.totalPages ?? 0;

      setPosts(content);
      setCurrentPage(pageNumber);
      setTotalPages(pagesTotal);
      setHasMore(pageNumber + 1 < pagesTotal);
    } catch (error) {
      console.error("Koleksiyon/Beğeni verileri çekilemedi:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Sonsuz kaydırma (Infinite Scroll) ile sonraki sayfayı yükleme
  const loadMorePosts = async (
    activeTab: "liked" | "bookmarked",
    postType?: string,
  ) => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      let data;

      if (activeTab === "liked") {
        data = await interactionService.getLikedPosts(nextPage, 5);
      } else {
        data = await interactionService.getBookmarkedPosts(
          postType,
          nextPage,
          5,
        );
      }

      const content = data?.content || [];
      const pageNumber = data?.number ?? nextPage;
      const pagesTotal = data?.totalPages ?? totalPages;

      setPosts((prev) => [...prev, ...content]);
      setCurrentPage(pageNumber);
      setHasMore(pageNumber + 1 < pagesTotal);
    } catch (error) {
      console.error("Daha fazla içerik yüklenirken hata oluştu:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return {
    posts,
    isLoadingMore,
    hasMore,
    currentPage,
    fetchPostsByType,
    loadMorePosts,
  };
}
