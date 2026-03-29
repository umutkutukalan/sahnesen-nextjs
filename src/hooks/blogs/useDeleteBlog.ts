import { deleteBlogService } from "@/services/client/blogs/blog.service";
import { useState } from "react";

export const useDeleteBlog = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const deleteBlog = async (blogId: number, onSuccess: () => void) => {
    setIsDeleting(true);
    setError(null);

    try {
      await deleteBlogService(blogId);
      console.log("Blog yazısı başarıyla silindi:", blogId);

      // Başarı durumunda callback çağır
      if (onSuccess && typeof onSuccess === "function") {
        onSuccess();
      }
    } catch (err) {
      console.error("Blog yazısı silinirken hata oluştu:", err);
      setError(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteBlog, isDeleting, error };
};
