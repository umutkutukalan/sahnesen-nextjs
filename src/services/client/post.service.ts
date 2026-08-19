import api from "./config";

// services/client/post.service.ts

export const createPostClient = async (payload: any) => {
  const response = await api.post("/api/posts/me", payload);
  return response.data;
};

export const updatePostClient = async (postId: number, payload: any) => {
  const response = await api.put(`/api/posts/me/${postId}`, payload);
  return response.data;
};

// Giriş yapmış kullanıcının postlarını çekme (Eklendiğin metottaki isPublic parametresini DTO ile uyumlu olacak şekilde isPublished da yapabiliriz)
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
