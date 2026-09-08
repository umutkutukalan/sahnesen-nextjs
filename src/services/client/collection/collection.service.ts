import api from "../config";

export interface CreateCollectionRequest {
  name: string;
  description?: string;
}

export const createCollectionClient = async (data: CreateCollectionRequest) => {
  const response = await api.post("/api/collections", data);
  return response.data;
};
