import { getPostsClient } from "@/services/client/post.service";
import { PostResponse } from "@/services/server/post.service";
import { useEffect, useState } from "react";

export const useGetPosts = (
  initialPosts: PostResponse[],
  initialPage: number,
  initialTotalPages: number,
) => {
  console.log("INIT", {
    initialPostsLength: initialPosts.length,
    initialPage,
    initialTotalPages,
  });

  const [posts, setPosts] = useState<PostResponse[]>(initialPosts);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [hasMore, setHasMore] = useState(initialPage + 1 < initialTotalPages);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // 🔑 KRİTİK: initial değerler geldikçe hasMore'u güncelle
  useEffect(() => {
    setHasMore(currentPage + 1 < totalPages);
  }, [currentPage, totalPages]);

  const loadMorePosts = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    const nextPage = currentPage + 1;
    const data = await getPostsClient(nextPage, 5);

    setPosts((prev) => [...prev, ...data.content]);
    setCurrentPage(data.number);
    setTotalPages(data.totalPages);
    setHasMore(data.number + 1 < data.totalPages);

    console.log("LOAD MORE FIRED", currentPage + 1);

    setIsLoadingMore(false);
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
