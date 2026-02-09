export const getLikeCountServiceProject = async (postId: number) => {
  const response = await fetch(
    `${process.env.API_URL}/projects/${postId}/like/count`,
    {
      cache: "no-store",
      credentials: "include", // cookie auth varsa
    },
  );
  if (!response.ok) {
    throw new Error("Failed to fetch like count");
  }
  return response.json();
};

export const getLikeCountServiceBlog = async (postId: number) => {
  const response = await fetch(
    `${process.env.API_URL}/blogs/${postId}/like/count`,
    {
      cache: "no-store",
      credentials: "include", // cookie auth varsa
    },
  );
  if (!response.ok) {
    throw new Error("Failed to fetch like count");
  }
  return response.json();
};
