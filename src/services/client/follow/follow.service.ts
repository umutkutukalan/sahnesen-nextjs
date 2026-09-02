import api from "../config";

export interface FollowDTO {
  id: number;
  username: string;
  name: string;
  surname: string;
  profileImg: string;
}

export const followService = {
  followUser: async (followingUsername: string) => {
    const res = await api.post(`/api/follows/${followingUsername}`);
    return res.data;
  },

  unfollowUser: async (followingUsername: string) => {
    const res = await api.delete(`/api/follows/${followingUsername}`);
    return res.data;
  },

  getFollowStats: async (username: string) => {
    const res = await api.get(`/api/follows/stats/${username}`);
    return res.data;
  },

  checkIsFollowing: async (followingUsername: string) => {
    const res = await api.get(`/api/follows/is-following/${followingUsername}`);
    return res.data;
  },

  // 💡 Sayfalama parametreleri eklendi
  getFollowing: async (username: string, page = 0, size = 6) => {
    const res = await api.get(
      `/api/follows/following/${username}?page=${page}&size=${size}`,
    );
    return res.data;
  },

  // 💡 Sayfalama parametreleri eklendi
  getFollowers: async (username: string, page = 0, size = 6) => {
    const res = await api.get(
      `/api/follows/followers/${username}?page=${page}&size=${size}`,
    );
    return res.data;
  },
};
