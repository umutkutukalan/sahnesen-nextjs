import {
  hasUserLikedBlog,
  hasUserLikedProject,
} from "@/services/client/projects/likes_project.service";
import { useState } from "react";

export const useHasUserLiked = () => {
  const [liked, setLiked] = useState<null | boolean>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasUserLiked = async (postId: number, type: "project" | "blog") => {
    try {
      const response = await (type === "project"
        ? hasUserLikedProject(postId)
        : hasUserLikedBlog(postId));
      setLiked(response.data);
    } catch (error) {
      console.error("Error checking if user liked post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { hasUserLiked, liked, isLoading };
};
