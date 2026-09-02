import { useState, useEffect } from "react";
import { useAuth } from "../../context/UserContext";
import { followService } from "@/services/client/follow/follow.service";

export const useFollow = (
  targetUsername: string,
  onFollowChange?: () => void,
) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
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

      // 💡 İşlem başarılı olunca dışarıdaki fonksiyonu tetikle (listeleri güncellemek için)
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
    isLoading,
    error,
    toggleFollow,
    canFollow: user && user.username !== targetUsername,
  };
};
