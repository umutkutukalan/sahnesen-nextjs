import axios from "axios";

export interface CommentRequest {
  content: string;
  parentId?: number | null;
}

export interface CommentResponse {
  id: number;
  content: string;
  createdAt: string;
  authorName: string;
  authorSurname: string;
  authorUsername: string;
  authorProfileImg?: string;
  replies: CommentResponse[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const commentService = {
  // Bir yazıya ait tüm fuaye mektuplarını getir
  async getComments(postId: number): Promise<CommentResponse[]> {
    const response = await axios.get<CommentResponse[]>(
      `${API_URL}/api/posts/${postId}/comments`,
      { withCredentials: true },
    );
    return response.data;
  },

  // Yeni fuaye mektubu veya alt yanıt ekle
  async addComment(
    postId: number,
    data: CommentRequest,
  ): Promise<CommentResponse> {
    const response = await axios.post<CommentResponse>(
      `${API_URL}/api/posts/${postId}/comments`,
      data,
      { withCredentials: true },
    );
    return response.data;
  },
};
