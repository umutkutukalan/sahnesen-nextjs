import { useState, useEffect } from "react";
import { useAuth } from "../../context/UserContext";
import { followService } from "@/services/client/follow/follow.service";

export const useFollow = (
  targetUsername: string,
  initialIsFollowing?: boolean,
  onFollowChange?: () => void,
) => {
  const { user } = useAuth();
  // Dışarıdan (ör. bildirim listesinden) zaten biliniyorsa
  // başlangıç değeri olarak onu kullan, yoksa false ile başla.
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing ?? false);
  const [followCounts, setFollowCounts] = useState({
    followingCount: 0,
    followerCount: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchFollowData = async () => {
      try {
        const stats = await followService.getFollowStats(targetUsername);
        setFollowCounts(stats);

        // initialIsFollowing zaten sağlanmışsa (bildirim/liste
        // ekranından geliyorsa) checkIsFollowing'i tekrar çağırıp
        // butonun anlık değişmesine gerek yok.
        if (
          user &&
          user.username !== targetUsername &&
          initialIsFollowing === undefined
        ) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUsername, user]);

  const toggleFollow = async () => {
    if (!user) return;
    if (user.username === targetUsername) return;

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

      if (onFollowChange) {
        onFollowChange();
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
    followLoading: isLoading,
    error,
    toggleFollow,
    canFollow: user && user.username !== targetUsername,
  };
};
