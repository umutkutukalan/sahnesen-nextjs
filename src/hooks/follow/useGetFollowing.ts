import { followService } from "@/services/client/follow/follow.service";
import { useState, useCallback } from "react";

export const useGetFollowing = () => {
  const [followings, setFollowing] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const getFollowing = useCallback(async (targetUserId: string | number) => {
    try {
      const response = await followService.getFollowing(targetUserId);
      setFollowing(response.data || []);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching following data:", error);
      throw error; // Hata durumunda hatayı fırlat
    }
  }, []);

  return { followings, setFollowing, isLoading, getFollowing };
};
