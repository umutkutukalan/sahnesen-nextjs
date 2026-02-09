import {
  unlikedServiceBlog,
  unlikedServiceProject,
} from "@/services/client/like/unliked.service";

export const useUnlikedPost = () => {
  const unlikedPost = async (postId: number, type: "project" | "blog") => {
    try {
      await (type === "project"
        ? unlikedServiceProject(postId)
        : unlikedServiceBlog(postId));
    } catch (error) {
      console.error("Error unliking post:", error);
      throw error;
    }
  };
  return { unlikedPost };
};
