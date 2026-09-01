import api from "../config";

export type ReactionType =
  | "LIKE"
  | "SHINE_SAHNE"
  | "SHINE_MONOLOG"
  | "SHINE_YANYANA"
  | "SHINE_TERSYUZ";

export interface BookmarkCollection {
  id: number;
  name: string;
  description?: string;
  isDefault: boolean;
}

export interface PostInteractionStatus {
  isLiked: boolean;
  isShined: boolean;
  isBookmarked: boolean;
  likeCount: number;
  shineCount: number;
}

export const interactionService = {
  // Beğen veya Mod Bazlı Parlat Toggle
  toggleReaction: async (postId: number, reactionType: ReactionType) => {
    const res = await api.post(
      `/api/interaction/posts/${postId}/reactions/toggle`,
      null,
      {
        params: { reactionType },
      },
    );
    return res.data;
  },

  // Kaydet / Kaydı Kaldır
  toggleBookmark: async (postId: number, collectionId?: number) => {
    const res = await api.post(
      `/api/interaction/posts/${postId}/bookmarks/toggle`,
      null,
      {
        params: { collectionId },
      },
    );
    return res.data;
  },

  // Post'un durumunu çekerken hangi shine türünün kontrol edileceğini parametre olarak gönderiyoruz
  getPostInteractionStatus: async (
    postId: number,
    targetShineType: ReactionType,
  ): Promise<PostInteractionStatus> => {
    const res = await api.get(`/api/interaction/posts/${postId}/interactions`, {
      params: { targetShineType },
    });
    return res.data;
  },

  // Kullanıcının klasörlerini getir
  getUserCollections: async (): Promise<BookmarkCollection[]> => {
    const res = await api.get(`/api/interaction/bookmark-collections`);
    return res.data;
  },

  // Yeni klasör oluştur
  createCollection: async (name: string, description?: string) => {
    const res = await api.post(`/api/interaction/bookmark-collections`, {
      name,
      description,
    });
    return res.data;
  },

  // BEĞENİLEN POSTLAR (Backend'de Controller tarafında karşılığı yazılacak veya PostReaction bazlı çekilecek)
  // Not: Eğer backend'de beğenilenler için ayrı bir endpoint'in yoksa /api/interaction/posts/liked gibi bir rota eklemen gerekebilir.
  getLikedPosts: async (page: number = 0, size: number = 5) => {
    const res = await api.get(`/api/interaction/posts/liked`, {
      params: { page, size },
    });
    return res.data; // Spring Page yapısı: { content, number, totalPages, ... }
  },

  // KAYDEDİLEN POSTLAR (Backend'deki BookmarkCollectionController -> /posts endpoint'ine bağlanır)
  getBookmarkedPosts: async (
    postType?: string,
    page: number = 0,
    size: number = 5,
  ) => {
    const res = await api.get(`/api/interaction/bookmark-collections/posts`, {
      params: { postType, page, size },
    });
    return res.data; // Spring Page yapısı: { content, number, totalPages, ... }
  },
};
