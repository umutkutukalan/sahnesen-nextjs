import {
  FollowDTO,
  followService,
} from "@/services/client/follow/follow.service";
import { useState, useCallback } from "react";

export const useGetFollowing = () => {
  const [followings, setFollowing] = useState<FollowDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const getFollowing = useCallback(
    async (username: string, reset = false) => {
      try {
        setIsLoading(true);
        const currentPage = reset ? 0 : page;
        const response = await followService.getFollowing(
          username,
          currentPage,
          6,
        );

        if (response.length < 6) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

        setFollowing((prev) => (reset ? response : [...prev, ...response]));
        if (!reset) setPage((prev) => prev + 1);
        if (reset) setPage(1);
      } catch (error) {
        console.error("Error fetching following data:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [page],
  );

  return { followings, setFollowing, isLoading, getFollowing, hasMore };
};
