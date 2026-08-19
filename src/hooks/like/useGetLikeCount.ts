import {
  getLikeCountServiceBlog,
  getLikeCountServiceProject,
} from "@/services/client/posts/likes_post.service";
import { useState } from "react";

export const useGetLikeCount = () => {
  const [likeCount, setLikeCount] = useState(0);
  const getLikeCount = async (postId: number, type: "blog" | "project") => {
    try {
      const response = await (type === "blog"
        ? getLikeCountServiceBlog(postId)
        : getLikeCountServiceProject(postId));
      setLikeCount(response.data);
    } catch (error) {
      console.error("Error fetching like count:", error);
    }
  };

  return { likeCount, getLikeCount };
};
