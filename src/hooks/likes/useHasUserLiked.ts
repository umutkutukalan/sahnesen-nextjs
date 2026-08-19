import {
  hasUserLikedBlog,
  hasUserLikedProject,
} from "@/services/client/posts/likes_post.service";
import { useState } from "react";

export const useHasUserLiked = () => {
  const [liked, setLiked] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasUserLiked = async (postId, type) => {
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
