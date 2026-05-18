import api from "@/services/client/config";

export const uploadImageToBackend = async (file: File, postId: number) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await api.post(`/api/posts/${postId}/images`, formData, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.url; // Backend'den dönen "/uploads/postImages/..." linki
  } catch (error) {
    console.error("Görsel yüklenirken backend patladı:", error);
    return null;
  }
};
