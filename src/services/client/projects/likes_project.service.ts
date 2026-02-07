import api from "../config";

export const getUserProjectsLikes = async (userId, page = 0, size = 5) => {
  try {
    const response = await api.get(`/users/${userId}/liked-projects`, {
      withCredentials: true, // HttpOnly cookie gönder
      params: {
        page,
        size,
        sort: "createdAt,desc",
      },
    });
    console.log("getUserProjectsLikes response:", response);
    return response;
  } catch (error) {
    console.error("Kullanıcı projeleri çekilirken hata:", error);
    throw error;
  }
};

export const getLikeCountServiceProject = async (postId) => {
  try {
    const response = await api.get(`/projects/${postId}/like/count`);
    return response;
  } catch (error) {
    console.error("Error fetching like count:", error);
    throw error;
  }
};

export const getLikeCountServiceBlog = async (postId) => {
  try {
    const response = await api.get(`/blogs/${postId}/like/count`);
    return response;
  } catch (error) {
    console.error("Error fetching like count:", error);
    throw error;
  }
};


export const hasUserLikedProject = async (projectId) => {
  try {
    const response = await api.get(`/projects/${projectId}/like/status`);
    return response;
  } catch (error) {
    console.error("Error checking if user liked project:", error);
    throw error;
  }
};

export const hasUserLikedBlog = async (blogId) => {
  try {
    const response = await api.get(`/blogs/${blogId}/like/status`);
    return response;
  } catch (error) {
    console.error("Error checking if user liked blog:", error);
    throw error;
  }
};
