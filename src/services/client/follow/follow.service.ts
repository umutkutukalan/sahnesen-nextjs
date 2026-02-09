import api from "../config";

export interface FollowId {
    followerId: number;
    followingId: number;
}

export const followService = {
  // Kullanıcıyı takip et
  followUser: async ({followingId, followerId}: FollowId) => {
    const response = await api.post(
      `/follows/${followingId}?followerId=${followerId}`,
      null,
      {
        withCredentials: true,
      }
    );
    return response.data;
  },

  // Kullanıcıyı takipten çıkar
  unfollowUser: async ({followingId, followerId}: FollowId) => {
    const response = await api.delete(
      `/follows/${followingId}?followerId=${followerId}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  },

  // Takip/takipçi sayılarını getir
  getFollowCounts: async (userId: number) => {
    const response = await api.get(`/follows/count/${userId}`);
    return response.data;
  },

  // Takip edilip edilmediğini kontrol et
  checkIsFollowing: async ({followerId, followingId}: FollowId) => {
    const response = await api.get(
      `/follows/check?followerId=${followerId}&followingId=${followingId}`
    );
    return response.data;
  },

  // Kullanıcının takip ettiklerini listele
  getFollowing: async (userId: number) => {
    const response = await api.get(`/follows/following/${userId}`);
    return response.data;
  },

  // Kullanıcının takipçilerini listele
  getFollowers: async (userId: number) => {
    const response = await api.get(`/follows/followers/${userId}`);
    return response.data;
  },
};
