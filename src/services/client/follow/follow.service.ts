import api from "../config";

export interface FollowDTO {
  id: number;
  followerUsername: string;
  followingUsername: string;
  followedAt: string;
}

export const followService = {
  // Kullanıcıyı takip et (Username ile)
  followUser: async (followingUsername: string) => {
    const res = await api.post(`/api/follows/${followingUsername}`);
    return res.data;
  },

  // Takipten çık (Username ile)
  unfollowUser: async (followingUsername: string) => {
    const res = await api.delete(`/api/follows/${followingUsername}`);
    return res.data;
  },

  // Takipçi ve takip edilen sayılarını getir (/api/follows/stats/{username})
  getFollowStats: async (username: string) => {
    const res = await api.get(`/api/follows/stats/${username}`);
    return res.data; // { followerCount: number, followingCount: number }
  },

  // Giriş yapmış kullanıcı bu kişiyi takip ediyor mu?
  checkIsFollowing: async (followingUsername: string) => {
    const res = await api.get(`/api/follows/is-following/${followingUsername}`);
    return res.data; // boolean
  },
};
