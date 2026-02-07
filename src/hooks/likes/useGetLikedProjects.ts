import { useState, useCallback, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { getUserProjectsLikes } from "@/services/client/projects/likes_project.service";
import { Project } from "@/services/server/project.service";

export const useGetUserLikedProjects = () => {
  const { user } = useUser();
  const userId = user?.id;
  const [likedProjects, setLikedProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const getUserLikedProjects = useCallback(
    async (page = 0, isLoadMore = false) => {
      try {
        if (isLoadMore) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
        }

        const response = await getUserProjectsLikes(userId, page, 5);
        console.log("User liked projects response:", response);
        const newProjects = response.data.content || response.data;

        if (isLoadMore) {
          setLikedProjects((prev) => {
            const existingIds = new Set(
              prev.map((project: Project) => project.id),
            );
            const uniqueNewProjects = newProjects.filter(
              (project: Project) => !existingIds.has(project.id),
            );
            return [...prev, ...uniqueNewProjects];
          });
        } else {
          setLikedProjects(newProjects);
        }

        if (response.data.totalPages !== undefined) {
          setTotalPages(response.data.totalPages);
          setCurrentPage(response.data.number || page);
          setHasMore(response.data.number + 1 < response.data.totalPages);
        } else {
          const contentLength = response.data.content
            ? response.data.content.length
            : response.data.length;
          setHasMore(contentLength === 5);
          setCurrentPage(page);
        }

        setIsLoading(false);
        setIsLoadingMore(false);
      } catch (error) {
        console.error("Kullanıcı beğendiği projeler çekilirken hata:", error);
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [userId],
  );

  const loadMoreLikedProjects = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      getUserLikedProjects(currentPage + 1, true);
    }
  }, [currentPage, hasMore, isLoadingMore, getUserLikedProjects]);

  useEffect(() => {
    if (userId) {
      getUserLikedProjects(0, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return {
    getUserLikedProjects,
    likedProjects,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMoreLikedProjects,
    currentPage,
    totalPages,
  };
};
