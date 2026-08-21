// hooks/projects/useGetUserPosts.ts
import { useInfiniteQuery } from "@tanstack/react-query";
import { getUserPostsService } from "@/services/client/post.service";

export const useGetUserPosts = (username: string, postType?: string) => {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    // postType queryKey'e eklendiği için sekme değişince otomatik cache veya fetch tetiklenir
    queryKey: ["userPosts", username, postType ?? "ALL"],
    queryFn: ({ pageParam = 0 }) =>
      getUserPostsService(username, postType, pageParam, 10),
    getNextPageParam: (lastPage) => {
      if (
        !lastPage ||
        lastPage.last ||
        lastPage.number + 1 >= lastPage.totalPages
      ) {
        return undefined;
      }
      return lastPage.number + 1;
    },
    initialPageParam: 0,
    enabled: !!username,
  });

  const userPosts = data?.pages.flatMap((page) => page.content || []) ?? [];

  return {
    userPosts,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    loadMoreUserPosts: fetchNextPage,
    refetch,
  };
};
