import api from "../config";

export interface CreateCollectionRequest {
  name: string;
  description?: string;
}

export interface BookmarkCollection {
  id: number;
  name: string;
  description: string;
  isDefault: boolean;
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
