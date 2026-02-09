import api from "../config";

export const ProjectLikeService = async (projectId: number) => {
  try {
    const response = await api.post(`/projects/${projectId}/like`);
    return response;
  } catch (error) {
    console.error("Error liking project:", error);
    throw error;
  }
};

export const BlogLikeService = async (blogId: number) => {
  try {
    const response = await api.post(`/blogs/${blogId}/like`);
    return response;
  } catch (error) {
    console.error("Error liking blog:", error);
    throw error;
  }
};
