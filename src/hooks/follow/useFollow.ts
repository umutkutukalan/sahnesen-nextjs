import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { followService } from "@/services/client/follow/follow.service";

export const useFollow = (targetUserId: number) => {
  const { user } = useUser();
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
        // Takip sayılarını getir
        const counts = await followService.getFollowCounts(targetUserId);
        setFollowCounts(counts);

        // Kullanıcı giriş yapmışsa takip durumunu kontrol et
        if (user && user.id !== targetUserId) {
          const following = await followService.checkIsFollowing({
            followerId: user.id,
            followingId: targetUserId,
          });
          setIsFollowing(following);
        }
      } catch (err) {
        console.error("Follow verisi getirilirken hata:", err);
        setError(err as Error);
      }
    };

    if (targetUserId) {
      fetchFollowData();
    }
  }, [targetUserId, user]);

  // Takip et/bırak toggle fonksiyonu
  const toggleFollow = async () => {
    if (!user) {
      console.warn("Kullanıcı giriş yapmamış");
      return;
    }

    if (user.id === targetUserId) {
      console.warn("Kullanıcı kendini takip edemez");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isFollowing) {
        await followService.unfollowUser({
          followerId: user.id,
          followingId: targetUserId,
        });
        setIsFollowing(false);
        setFollowCounts((prev) => ({
          ...prev,
          followerCount: prev.followerCount - 1,
        }));
        console.log("Takipten çıkıldı");
      } else {
        await followService.followUser({
          followerId: user.id,
          followingId: targetUserId,
        });
        setIsFollowing(true);
        setFollowCounts((prev) => ({
          ...prev,
          followerCount: prev.followerCount + 1,
        }));
        console.log("Takip edildi");
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
    canFollow: user && user.id !== targetUserId,
  };
};
