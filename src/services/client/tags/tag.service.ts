import api from "../config";

export const searchTagsClient = async (query: string): Promise<string[]> => {
  try {
    const response = await api.get(`/api/posts/tags/autocomplete`, {
      params: { query },
    });

    const data = response.data;
    if (Array.isArray(data)) {
      return data.map((tag: any) => (typeof tag === "string" ? tag : tag.name));
    }

    return [];
  } catch (error) {
    console.error("Etiket arama hatası:", error);
    return [];
  }
};
