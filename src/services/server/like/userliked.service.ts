export const hasUserLikedProject = async (projectId: number) => {
  const response = await fetch(
    `${process.env.API_URL}/projects/${projectId}/like/status`,
    {
      cache: "no-store",
      credentials: "include",
    },
  );
  if (!response.ok) {
    throw new Error("Failed to check if user liked project");
  }
  return response.json();
};

export const hasUserLikedBlog = async (blogId: number) => {
  const response = await fetch(
    `${process.env.API_URL}/blogs/${blogId}/like/status`,
    {
      cache: "no-store",
      credentials: "include",
    },
  );
  if (!response.ok) {
    throw new Error("Failed to check if user liked blog");
  }
  return response.json();
};
