import api from "./config";

// services/client/post.service.ts

export interface FetchPostsParams {
  page?: number;
  size?: number;
  isPublished?: boolean;
}

// 1. PUBLIC: Tum yayinlanmis gönderileri getir (Ana Akis / Feed)
export const getPostsClient = async (page = 0, size = 10) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/posts?page=${page}&size=${size}`,
      {
        cache: "no-store",
      },
    );

    if (!res.ok) {
      throw new Error(`Posts fetch failed with status: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Gönderiler çekilirken hata:", error);
    throw error;
  }
};

// 2. PUBLIC: Belirli bir kullanicinin kamuya açik gönderileri
export const getUserPostsService = async (
  username: string,
  page = 0,
  size = 10,
) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/posts/user/${username}?page=${page}&size=${size}`,
      {
        cache: "no-store",
      },
    );

    if (!res.ok) {
      throw new Error(`User posts fetch failed with status: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Kullanıcı gönderileri çekilirken hata:", error);
    throw error;
  }
};

// 3. AUTH (ME): Giris yapmis kullanicinin kendi postlari (Yayinlananlar veya Taslaklar)
export const getMyPostsClient = async (
  isPublished?: boolean,
  page = 0,
  size = 10,
) => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (isPublished !== undefined) {
    params.append("isPublished", isPublished.toString());
  }

  const response = await api.get(`/api/posts/me?${params.toString()}`);
  return response.data;
};

// 4. AUTH: Yeni Gönderi / Taslak Oluşturma
export const createPostClient = async (payload: any) => {
  const response = await api.post("/api/posts/me", payload);
  return response.data;
};

// 5. AUTH: Gönderi / Taslak Güncelleme
export const updatePostClient = async (postId: number, payload: any) => {
  const response = await api.put(`/api/posts/me/${postId}`, payload);
  return response.data;
};

// 6. AUTH: Gönderi Silme
export const deletePostService = async (postId: number) => {
  const response = await api.delete(`/api/posts/me/${postId}`);
  return response.data;
};
