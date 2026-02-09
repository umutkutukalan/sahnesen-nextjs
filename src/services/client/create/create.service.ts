import api from "../config";

export const createContentService = async (payload, resourceType) => {
  try {
    const response = await api.post(`/${resourceType}`, payload, {
      withCredentials: true, // HttpOnly cookie gönder
    });
    return response;
  } catch (error) {
    console.error("İçerik oluşturulurken hata:", error);
    throw error;
  }
};
