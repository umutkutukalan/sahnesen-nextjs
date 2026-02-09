import api from "../config";

export const unlikedServiceProject = async (postId: number) => {
  try {
    const response = await api.delete(`/projects/${postId}/like`);
    return response;
  } catch (error) {
    console.error("Error unliking post:", error);
    throw error;
  }
};

export const unlikedServiceBlog = async (postId: number) => {
  try {
    const response = await api.delete(`/blogs/${postId}/like`);
    return response;
  } catch (error) {
    console.error("Error unliking post:", error);
    throw error;
  }
};
