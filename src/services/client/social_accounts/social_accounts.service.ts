const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface SocialAccountData {
  platform: string;
  url: string;
  isPublic?: boolean;
}

export interface UpdateSocialAccountData {
  platform?: string;
  url?: string;
  isPublic?: boolean;
}

export const socialAccountService = {
  createSocialAccount: async (
    userId: number | string,
    socialData: SocialAccountData,
  ) => {
    const response = await fetch(
      `${BASE_URL}/social-media/${userId}/platforms`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(socialData),
      },
    );
    return response.json();
  },

  deleteSocialAccount: async (platformId: number | string) => {
    const response = await fetch(`${BASE_URL}/social-media/${platformId}`, {
      method: "DELETE",
      credentials: "include",
    });
    return response.json();
  },

  getPublicSocialAccounts: async (userId: number | string) => {
    const response = await fetch(
      `${BASE_URL}/social-media/users/${userId}/platforms/public`,
      {
        credentials: "include",
      },
    );
    return response.json();
  },

  getSocialAccounts: async (userId: number | string) => {
    const response = await fetch(
      `${BASE_URL}/social-media/users/${userId}/platforms`,
      {
        credentials: "include",
      },
    );
    return response.json();
  },

  updateSocialAccount: async (
    platformId: number | string,
    updateData: UpdateSocialAccountData,
  ) => {
    const response = await fetch(`${BASE_URL}/social-media/${platformId}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });
    return response.json();
  },
};
