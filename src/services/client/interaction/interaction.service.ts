import api from "../config";

export type ReactionType = "LIKE" | "SHINE";

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
  // Beğen veya Parlat Toggle
  toggleReaction: async (postId: number, reactionType: ReactionType) => {
    const res = await api.post(`/posts/${postId}/reactions/toggle`, null, {
      params: { reactionType },
    });
    return res.data;
  },

  // Kaydet / Kaydı Kaldır (collectionId opsiyoneldir, verilmezse varsayılan klasöre atar)
  toggleBookmark: async (postId: number, collectionId?: number) => {
    const res = await api.post(`/posts/${postId}/bookmarks/toggle`, null, {
      params: { collectionId },
    });
    return res.data;
  },

  // Post'un kullanıcının anlık etkileşim durumu ve sayıları
  getPostInteractionStatus: async (
    postId: number,
  ): Promise<PostInteractionStatus> => {
    const res = await api.get(`/posts/${postId}/interactions`);
    return res.data;
  },

  // Kullanıcının klasörlerini getir
  getUserCollections: async (): Promise<BookmarkCollection[]> => {
    const res = await api.get(`/bookmark-collections`);
    return res.data;
  },

  // Yeni klasör oluştur
  createCollection: async (name: string, description?: string) => {
    const res = await api.post(`/bookmark-collections`, { name, description });
    return res.data;
  },
};
