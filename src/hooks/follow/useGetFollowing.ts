import { followService } from "@/services/client/follow/follow.service";
import { useState, useCallback } from "react";

export const useGetFollowing = () => {
  const [followings, setFollowing] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 💡 targetUserId yerine username alıyoruz
  const getFollowing = useCallback(async (username: string) => {
    try {
      setIsLoading(true);
      const response = await followService.getFollowing(username); // Serviste de username'e çevrilecek
      setFollowing(response || []);
    } catch (error) {
      console.error("Error fetching following data:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { followings, setFollowing, isLoading, getFollowing };
};
