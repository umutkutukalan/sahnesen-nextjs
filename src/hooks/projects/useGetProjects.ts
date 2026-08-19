import { getProjectsClient } from "@/services/client/projects/project.service";
import { PostResponse } from "@/services/server/post.service";
import { useEffect, useState } from "react";

export const useGetProjects = (
  initialProjects: PostResponse[],
  initialPage: number,
  initialTotalPages: number,
) => {
  console.log("INIT", {
    initialProjectsLength: initialProjects.length,
    initialPage,
    initialTotalPages,
  });

  const [projects, setProjects] = useState<PostResponse[]>(initialProjects);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [hasMore, setHasMore] = useState(initialPage + 1 < initialTotalPages);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // 🔑 KRİTİK: initial değerler geldikçe hasMore'u güncelle
  useEffect(() => {
    setHasMore(currentPage + 1 < totalPages);
  }, [currentPage, totalPages]);

  const loadMoreProjects = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    const nextPage = currentPage + 1;
    const data = await getProjectsClient(nextPage, 5);

    setProjects((prev) => [...prev, ...data.content]);
    setCurrentPage(data.number);
    setTotalPages(data.totalPages);
    setHasMore(data.number + 1 < data.totalPages);

    console.log("LOAD MORE FIRED", currentPage + 1);

    setIsLoadingMore(false);
  };

  return {
    projects,
    loadMoreProjects,
    isLoadingMore,
    hasMore,
    currentPage,
    totalPages,
  };
};
