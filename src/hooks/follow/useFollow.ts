import { useState, useEffect } from "react";
import { useAuth } from "../../context/UserContext";
import { followService } from "@/services/client/follow/follow.service";

export const useFollow = (targetUsername: string) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followCounts, setFollowCounts] = useState({
    followingCount: 0,
    followerCount: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Takip durumunu ve sayıları getir
  useEffect(() => {
    const fetchFollowData = async () => {
      try {
        // Takip sayılarını getir (Public endpoint)
        const stats = await followService.getFollowStats(targetUsername);
        setFollowCounts(stats);

        // Kullanıcı giriş yapmışsa ve kendi profili değilse takip durumunu kontrol et
        if (user && user.username !== targetUsername) {
          const following =
            await followService.checkIsFollowing(targetUsername);
          setIsFollowing(following);
        }
      } catch (err) {
        console.error("Follow verisi getirilirken hata:", err);
        setError(err as Error);
      }
    };

    if (targetUsername) {
      fetchFollowData();
    }
  }, [targetUsername, user]);

  // Takip et/bırak toggle fonksiyonu
  const toggleFollow = async () => {
    if (!user) {
      console.warn("Kullanıcı giriş yapmamış");
      return;
    }

    if (user.username === targetUsername) {
      console.warn("Kullanıcı kendini takip edemez");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isFollowing) {
        await followService.unfollowUser(targetUsername);
        setIsFollowing(false);
        setFollowCounts((prev) => ({
          ...prev,
          followerCount: Math.max(0, prev.followerCount - 1),
        }));
      } else {
        await followService.followUser(targetUsername);
        setIsFollowing(true);
        setFollowCounts((prev) => ({
          ...prev,
          followerCount: prev.followerCount + 1,
        }));
      }
    } catch (err) {
      console.error("Takip işlemi sırasında hata:", err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isFollowing,
    followCounts,
    isLoading,
    error,
    toggleFollow,
    canFollow: user && user.username !== targetUsername,
  };
};
