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

// Belirli kullanıcının blogları
export const getUserBlogsService = async (
  userId: string | number,
  page = 0,
  size = 5,
) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/blogs?userId=${userId}&page=${page}&size=${size}&sort=createdAt,desc`,
      {
        credentials: "include",
        cache: "no-store",
      },
    );
    return response.json();
  } catch (error) {
    console.error("Kullanıcı blogları çekilirken hata:", error);
    throw error;
  }
};

export const deleteBlogService = async (blogId: number) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/blogs/${blogId}`,
      {
        method: "DELETE",
      },
    );
    console.log("Silme işlemi başarılı:", response.status);
    return response.json();
  } catch (error) {
    console.error("Blog yazısı silinirken hata oluştu:", error);
    throw error; // Hata durumunda hatayı fırlat
  }
};
