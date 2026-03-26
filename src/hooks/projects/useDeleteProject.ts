import { deleteProjectService } from "@/services/client/projects/project.service";
import { useState } from "react";

export const useDeleteProject = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const deleteProject = async (projectId: number, onSuccess: () => void) => {
    setIsDeleting(true);
    setError(null);

    try {
      await deleteProjectService(projectId);
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

  return { deleteProject, isDeleting, error };
};
