import {
  BlogLikeService,
  ProjectLikeService,
} from "@/services/client/like/like.service";

export const usePostLike = () => {
  const likedPost = async (postId: number, type: "project" | "blog") => {
    try {
      if (type === "project") {
        await ProjectLikeService(postId);
        console.log("Project liked:", postId);
      } else if (type === "blog") {
        await BlogLikeService(postId);
        console.log("Blog liked:", postId);
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };
  return { likedPost };
};
