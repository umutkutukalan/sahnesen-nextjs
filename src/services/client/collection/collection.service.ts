import api from "../config";

export interface CreateCollectionRequest {
  name: string;
  description?: string;
}

export interface PostPreviewDTO {
  id: number;
  title: string;
  coverImage: string;
}

export interface BookmarkCollection {
  id: number;
  name: string;
  description: string;
  isDefault: boolean;
  contents: PostPreviewDTO[];
}

export const getUserCollectionsClient = async (): Promise<
  BookmarkCollection[]
> => {
  const response = await api.get("/api/interaction/bookmark-collections");
  return response.data;
};

export const createCollectionClient = async (data: CreateCollectionRequest) => {
  const response = await api.post(
    "/api/interaction/bookmark-collections",
    data,
  );
  return response.data;
};

export const addPostToCollectionClient = async (
  collectionId: number,
  postId: number,
) => {
  const response = await api.post(
    `/api/interaction/bookmark-collections/${collectionId}/posts/${postId}`,
  );
  return response.data;
};

export const getCollectionPostsClient = async (
  collectionId: number,
  page = 0,
  size = 10,
) => {
  const response = await api.get(
    `/api/interaction/bookmark-collections/${collectionId}/posts?page=${page}&size=${size}`,
  );
  return response.data; // Page<PostSummaryResponse> yapısı döner
};

export const updateCollectionClient = async (
  collectionId: number,
  data: CreateCollectionRequest,
) => {
  const response = await api.put(
    `/api/interaction/bookmark-collections/${collectionId}`,
    data,
  );
  return response.data;
};

export const deleteCollectionClient = async (collectionId: number) => {
  const response = await api.delete(
    `/api/interaction/bookmark-collections/${collectionId}`,
  );
  return response.data;
};
