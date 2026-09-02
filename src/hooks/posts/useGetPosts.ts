import {
  getPostsClient,
  getFollowingPostsClient,
} from "@/services/client/post.service";
import { PostResponse } from "@/services/server/post.service";
import { useEffect, useState } from "react";

export const useGetPosts = (
  initialPosts: PostResponse[],
  initialPage: number,
  initialTotalPages: number,
  postType?: string,
  feedScope: "all" | "following" = "all", // 🔑 Akış kapsamı eklendi
) => {
  const [posts, setPosts] = useState<PostResponse[]>(initialPosts);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [hasMore, setHasMore] = useState(initialPage + 1 < initialTotalPages);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // 🔑 feedScope veya postType değiştiğinde verileri baştan çek
  useEffect(() => {
    const fetchFilteredPosts = async () => {
      setIsLoadingMore(true);
      try {
        const data =
          feedScope === "following"
            ? await getFollowingPostsClient(postType, 0, 5)
            : await getPostsClient(postType, 0, 5);

        setPosts(data.content || []);
        setCurrentPage(data.number);
        setTotalPages(data.totalPages);
        setHasMore(data.number + 1 < data.totalPages);
      } catch (error) {
        console.error("Filtrelenmiş gönderiler yüklenirken hata:", error);
        setPosts([]);
        setTotalPages(0);
        setHasMore(false);
      } finally {
        setIsLoadingMore(false);
      }
    };

    fetchFilteredPosts();
  }, [postType, feedScope]);

  // 🔑 hasMore güncellemesi
  useEffect(() => {
    setHasMore(currentPage + 1 < totalPages);
  }, [currentPage, totalPages]);

  const loadMorePosts = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    try {
      const nextPage = currentPage + 1;

      const data =
        feedScope === "following"
          ? await getFollowingPostsClient(postType, nextPage, 5)
          : await getPostsClient(postType, nextPage, 5);

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
