// hooks/projects/useDeleteProject.ts
import { deletePostService } from "@/services/client/post.service";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export const useDeletePosts = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const queryClient = useQueryClient();

  const deletePost = async (projectId: number, onSuccess?: () => void) => {
    setIsDeleting(true);
    setError(null);

    try {
      await deletePostService(projectId);

      // 💥 CRITICAL FIX: "userPosts" ile başlayan tüm query cache'lerini sıfırla
      // exact: false (varsayılan) olduğu için ["userPosts", "username", "SAHNE"] gibi tüm alt key'leri otomatik yakalar ve refetch eder.
      await queryClient.invalidateQueries({
        queryKey: ["userPosts"],
      });

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
