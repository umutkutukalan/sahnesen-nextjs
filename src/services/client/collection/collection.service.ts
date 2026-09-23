import api from "../config";

export interface CreateCollectionRequest {
  name: string;
  description?: string;
}

export interface PostPreviewDTO {
  id: number;
  title: string;
  coverImages: string[];
}

export interface BookmarkCollection {
  id: number;
  name: string;
  description: string;
  slug: string;
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

export async function getCollectionPostsBySlugClient(
  slug: string,
  page: number = 0,
  size: number = 6,
  postType?: string,
) {
  const validPostType =
    !postType || postType === "undefined" ? undefined : postType;
  const res = await api.get(
    `/api/interaction/bookmark-collections/${slug}/posts`,
    {
      params: {
        page,
        size,
        postType: validPostType,
      },
    },
  );
  return res.data;
}

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
