const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface FollowId {
    followerId: number;
    followingId: number;
}

export const followService = {
  followUser: async ({followingId, followerId}: FollowId) => {
    const response = await fetch(
      `${BASE_URL}/follows/${followingId}?followerId=${followerId}`,
      {
        method: "POST",
        credentials: "include",
      }
    );
    return response.json();
  },

  unfollowUser: async ({followingId, followerId}: FollowId) => {
    const response = await fetch(
      `${BASE_URL}/follows/${followingId}?followerId=${followerId}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );
    return response.json();
  },

  getFollowCounts: async (userId: number) => {
    const response = await fetch(`${BASE_URL}/follows/count/${userId}`);
    return response.json();
  },

  checkIsFollowing: async ({followerId, followingId}: FollowId) => {
    const response = await fetch(
      `${BASE_URL}/follows/check?followerId=${followerId}&followingId=${followingId}`
    );
    return response.json();
  },

  getFollowing: async (userId: number) => {
    const response = await fetch(`${BASE_URL}/follows/following/${userId}`);
    return response.json();
  },

  getFollowers: async (userId: number) => {
    const response = await fetch(`${BASE_URL}/follows/followers/${userId}`);
    return response.json();
  },
};