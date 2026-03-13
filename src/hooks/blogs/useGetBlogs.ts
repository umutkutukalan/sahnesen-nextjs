import { getBlogsClient } from "@/services/client/blogs/blog.service";
import { Blog } from "@/services/server/blog.service";
import { useEffect, useState } from "react";

export const useGetBlogs = (
  initialBlogs: Blog[],
  initialPage: number,
  initialTotalPages: number,
) => {
  console.log("INIT", {
    initialBlogsLength: initialBlogs.length,
    initialPage,
    initialTotalPages,
  });

  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [hasMore, setHasMore] = useState(initialPage + 1 < initialTotalPages);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // 🔑 KRİTİK: initial değerler geldikçe hasMore'u güncelle
  useEffect(() => {
    setHasMore(currentPage + 1 < totalPages);
  }, [currentPage, totalPages]);

  const loadMoreBlogs = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    const nextPage = currentPage + 1;
    const data = await getBlogsClient(nextPage, 5);

    setBlogs((prev) => [...prev, ...data.content]);
    setCurrentPage(data.number);
    setTotalPages(data.totalPages);
    setHasMore(data.number + 1 < data.totalPages);

    console.log("LOAD MORE FIRED", currentPage + 1);

    setIsLoadingMore(false);
  };

  return {
    blogs,
    loadMoreBlogs,
    isLoadingMore,
    hasMore,
    currentPage,
    totalPages,
  };
};
