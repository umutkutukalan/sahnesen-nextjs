import { followService } from "@/services/client/follow/follow.service";
import { useState, useCallback } from "react";

export const useGetFollowers = () => {
  const [followers, setFollowers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getFollowers = useCallback(async (targetUserId: string | number) => {
    try {
      const response = await followService.getFollowers(targetUserId);
      setFollowers(response.data || []);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching followers data:", error);
      throw error; // Hata durumunda hatayı fırlat
    }
  }, []);

  return { followers, setFollowers, isLoading, getFollowers };
};
