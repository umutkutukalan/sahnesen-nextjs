import api from "./config";

export interface FetchPostsParams {
  page?: number;
  size?: number;
  type?: string;
  isPublished?: boolean;
}

// Helper: Content'in Map<String, Object> formatında (JS Object) olmasını garanti et
const ensureValidContent = (content: any) => {
  if (!content) {
    return { type: "doc", content: [] };
  }
  if (typeof content === "string") {
    try {
      return JSON.parse(content);
    } catch {
      return { type: "doc", content: [] };
    }
  }
  return content;
};

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
      { cache: "no-store" },
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Backend Error Details:", errorText);
      throw new Error(
        `Posts fetch failed status [${res.status}]: ${errorText}`,
      );
    }

    return await res.json();
  } catch (error) {
    console.error("Gönderiler çekilirken hata:", error);
    throw error;
  }
};

// 2. PUBLIC: Belirli bir kullanıcının kamuya açık gönderileri
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
      { cache: "no-store" },
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

// 3. AUTH (ME): Kullanıcının kendi postları
export const getMyPostsClient = async ({
  isPublished,
  postType,
  page = 0,
  size = 10,
}: {
  isPublished?: boolean;
  postType?: string;
  page?: number;
  size?: number;
}) => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (isPublished !== undefined) {
    params.append("isPublished", isPublished.toString());
  }

  if (postType && postType !== "ALL") {
    params.append("postType", postType);
  }

  const response = await api.get(`/api/posts/me?${params.toString()}`);
  return response.data;
};

// 3.1. AUTH (ME): Slug ile gönderi getir
export const getPostBySlugClient = async (slug: string) => {
  const response = await api.get(`/api/posts/${slug}`);
  return response.data;
};

// 4. AUTH: Yeni Gönderi / Taslak Oluşturma
export const createPostClient = async (payload: any) => {
  const formattedPayload = {
    postType: payload.postType || "SAHNE",
    title:
      payload.title && payload.title.trim().length >= 3
        ? payload.title
        : "Başlıksız Taslak",
    subtitle: payload.subtitle || null,
    content: ensureValidContent(payload.content),
    coverImage: payload.coverImage || null,
    isPublished: Boolean(payload.isPublished),
  };

  const response = await api.post("/api/posts/me", formattedPayload);
  return response.data;
};

// 5. AUTH: Gönderi / Taslak Güncelleme
export const updatePostClient = async (postId: number, payload: any) => {
  const formattedPayload = {
    postType: payload.postType || "SAHNE",
    title:
      payload.title && payload.title.trim().length >= 3
        ? payload.title
        : "Başlıksız Taslak",
    subtitle: payload.subtitle || null,
    content: ensureValidContent(payload.content),
    coverImage: payload.coverImage || null,
    isPublished: Boolean(payload.isPublished),
  };

  const response = await api.put(`/api/posts/me/${postId}`, formattedPayload);
  return response.data;
};

// 6. AUTH: Gönderi Silme
export const deletePostService = async (postId: number) => {
  const response = await api.delete(`/api/posts/me/${postId}`);
  return response.data;
};
