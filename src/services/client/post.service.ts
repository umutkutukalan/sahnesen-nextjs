import { type } from "os";
import api from "./config";

// services/client/post.service.ts

export interface FetchPostsParams {
  page?: number;
  size?: number;
  type?: string;
  isPublished?: boolean;
}

// 1. PUBLIC: Tüm yayınlanmış gönderileri getir (Ana Akış / Feed)
export const getPostsClient = async (
  postType?: string,
  page = 0,
  size = 10,
) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (postType) {
      params.append("postType", postType);
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/posts?${params.toString()}`,
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

// 2. PUBLIC: Belirli bir kullanıcının kamuya açık gönderileri (Profil Sayfası)
export const getUserPostsService = async (
  username: string,
  postType?: string,
  page = 0,
  size = 10,
) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (postType) {
      params.append("postType", postType);
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/posts/user/${username}?${params.toString()}`,
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

// 3. AUTH (ME): Giriş yapmış kullanıcının kendi postları (Yayınlananlar, Taslaklar ve Tipe göre)
export const getMyPostsClient = async (
  isPublished?: boolean,
  postType?: string,
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

  if (postType) {
    params.append("postType", postType);
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
