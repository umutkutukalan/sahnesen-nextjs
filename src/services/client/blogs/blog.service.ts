export const getBlogsClient = async (page = 0, size = 5) => {
  console.log("API_URL:", process.env.NEXT_PUBLIC_API_URL);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/blogs?page=${page}&size=${size}&sort=createdAt,desc`,
    {
      cache: "no-store", // feed her zaman güncel
    },
  );

  if (!res.ok) {
    throw new Error("Blogs fetch failed");
  }

  return res.json(); // Spring Page<>
};
