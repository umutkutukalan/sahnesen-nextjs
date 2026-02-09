import { createContentService } from "@/services/client/create/create.service";

export const useCreateContent = () => {
  const createContent = async (payload, resourceType) => {
    if (!payload) {
      console.error("Payload Gönderilmedi");
      return;
    }
    try {
      const response = await createContentService(payload, resourceType);
      console.log("Proje oluşturuldu:", response);
    } catch (error) {
      console.error("Proje oluşturulurken hata:", error);
      throw error;
    }
  };

  return { createContent };
};
