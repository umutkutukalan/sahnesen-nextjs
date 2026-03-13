// services/server/blog.service.ts

export interface Blog {
  id: number;
  title: string;
  slug: string;
  content: any[];
  user: any;
  createdAt: string;
  image?: string;
}

export const getBlogBySlug = async (
  usernameSlug: string,
  blogSlug: string,
): Promise<Blog | null> => {
  const res = await fetch(
    `${process.env.API_URL}/blogs/${usernameSlug}/${blogSlug}`,
    {
      cache: "no-store",
      credentials: "include", // cookie auth varsa
    },
  );

  if (!res.ok) {
    return null;
  }

  return res.json();
};

export const getBlogsServer = async (page = 0, size = 5) => {
  console.log("API_URL:", process.env.API_URL);
  const res = await fetch(
    `${process.env.API_URL}/blogs?page=${page}&size=${size}&sort=createdAt,desc`,
    {
      cache: "no-store", // feed her zaman güncel
    },
  );

  if (!res.ok) {
    throw new Error("Blogs fetch failed");
  }

  return res.json(); // Spring Page<>
};
