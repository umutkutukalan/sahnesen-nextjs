import { deletePostService } from "@/services/client/post.service";
import { useState } from "react";

export const useDeletePosts = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const deletePost = async (projectId: number, onSuccess: () => void) => {
    setIsDeleting(true);
    setError(null);

    try {
      await deletePostService(projectId);
      console.log("Proje başarıyla silindi:", projectId);

      // Başarı durumunda callback çağır
      if (onSuccess && typeof onSuccess === "function") {
        onSuccess();
      }
    } catch (err) {
      console.error("Proje silinirken hata oluştu:", err);
      setError(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return { deletePost, isDeleting, error };
};
