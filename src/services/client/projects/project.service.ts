export const getProjectsClient = async (page = 0, size = 5) => {
  console.log("API_URL:", process.env.NEXT_PUBLIC_API_URL);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/projects?page=${page}&size=${size}&sort=createdAt,desc`,
    {
      cache: "no-store", // feed her zaman güncel
    },
  );

  if (!res.ok) {
    throw new Error("Projects fetch failed");
  }

  return res.json(); // Spring Page<>
};
