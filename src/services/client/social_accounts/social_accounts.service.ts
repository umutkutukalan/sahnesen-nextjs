const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface SocialAccountData {
  platform: string;
  username: string; // backend url'i bundan üretiyor (WEBSITE hariç)
  url?: string; // manuel override (örn. WEBSITE tipi)
  isPublic?: boolean;
}

export interface UpdateSocialAccountData {
  platform?: string;
  username?: string;
  url?: string;
  isPublic?: boolean;
}

export interface SocialAccount {
  id: number;
  platform: string;
  username: string;
  url: string;
  isPublic: boolean;
}

async function handleResponse<T>(response: Response): Promise<T | null> {
  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(`İstek başarısız (${response.status}): ${message}`);
  }

  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as T;
  } catch {
    // Beklenmedik durum: body var ama JSON değil
    return null;
  }
}

export const socialAccountService = {
  createSocialAccount: async (
    socialData: SocialAccountData,
  ): Promise<SocialAccount> => {
    const response = await fetch(`${BASE_URL}/api/users/me/social`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(socialData),
    });
    return (await handleResponse<SocialAccount>(response))!;
  },

  deleteSocialAccount: async (platformId: number | string): Promise<void> => {
    const response = await fetch(
      `${BASE_URL}/api/users/me/social/${platformId}`,
      {
        method: "DELETE",
        credentials: "include",
      },
    );
    await handleResponse<void>(response);
  },

  getSocialAccounts: async (): Promise<SocialAccount[]> => {
    const response = await fetch(`${BASE_URL}/api/users/me/social`, {
      credentials: "include",
    });
    return (await handleResponse<SocialAccount[]>(response)) ?? [];
  },

  // DİKKAT: backend'de userId üzerinden çalışacak yeni public endpoint gerekiyor (aşağıda)
  getPublicSocialAccounts: async (
    username: string,
  ): Promise<SocialAccount[]> => {
    const response = await fetch(`${BASE_URL}/api/users/${username}/social`, {
      credentials: "include",
    });
    return (await handleResponse<SocialAccount[]>(response)) ?? [];
  },

  updateSocialAccount: async (
    platformId: number | string,
    updateData: UpdateSocialAccountData,
  ): Promise<SocialAccount> => {
    const response = await fetch(
      `${BASE_URL}/api/users/me/social/${platformId}`,
      {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      },
    );
    return (await handleResponse<SocialAccount>(response))!;
  },
};
