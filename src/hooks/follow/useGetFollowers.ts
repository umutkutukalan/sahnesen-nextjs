import { followService } from "@/services/client/follow/follow.service";
import { useState, useCallback } from "react";

export const useGetFollowers = () => {
  const [followers, setFollowers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 💡 targetUserId yerine username alıyoruz
  const getFollowers = useCallback(async (username: string) => {
    try {
      setIsLoading(true);
      const response = await followService.getFollowers(username); // Serviste de username'e çevrilecek
      setFollowers(response || []);
    } catch (error) {
      console.error("Error fetching followers data:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { followers, setFollowers, isLoading, getFollowers };
};
