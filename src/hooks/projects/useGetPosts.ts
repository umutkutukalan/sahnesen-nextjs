import { getPostsClient } from "@/services/client/post.service";
import { PostResponse } from "@/services/server/post.service";
import { useEffect, useState } from "react";

export const useGetPosts = (
  initialPosts: PostResponse[],
  initialPage: number,
  initialTotalPages: number,
  postType?: string,
) => {
  const [posts, setPosts] = useState<PostResponse[]>(initialPosts);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [hasMore, setHasMore] = useState(initialPage + 1 < initialTotalPages);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // 🔑 postType değiştiğinde (örneğin "SAHNE" seçildiğinde) listenin baştan çekilmesi
  useEffect(() => {
    // İlk render'da varsayılan filtrede tekrar istek atmamak için kontrol
    const fetchFilteredPosts = async () => {
      setIsLoadingMore(true);
      try {
        // ✅ Doğru Çağrı: postType (1. parametre), page (2. parametre), size (3. parametre)
        const data = await getPostsClient(postType, 0, 5);
        setPosts(data.content || []);
        setCurrentPage(data.number);
        setTotalPages(data.totalPages);
        setHasMore(data.number + 1 < data.totalPages);
      } catch (error) {
        console.error("Filtrelenmiş gönderiler yüklenirken hata:", error);
      } finally {
        setIsLoadingMore(false);
      }
    };

    fetchFilteredPosts();
  }, [postType]);

  // 🔑 hasMore güncellemesi
  useEffect(() => {
    setHasMore(currentPage + 1 < totalPages);
  }, [currentPage, totalPages]);

  const loadMorePosts = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    try {
      const nextPage = currentPage + 1;

      // ✅ Doğru Sıralama: getPostsClient(postType, page, size)
      const data = await getPostsClient(postType, nextPage, 5);

      setPosts((prev) => [...prev, ...data.content]);
      setCurrentPage(data.number);
      setTotalPages(data.totalPages);
      setHasMore(data.number + 1 < data.totalPages);
    } catch (error) {
      console.error("Daha fazla gönderi yüklenirken hata:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return {
    posts,
    loadMorePosts,
    isLoadingMore,
    hasMore,
    currentPage,
    totalPages,
  };
};
