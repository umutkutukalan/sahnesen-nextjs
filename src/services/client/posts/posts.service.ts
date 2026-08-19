export const getPostsClient = async (page = 0, size = 5) => {
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

// Belirli kullanıcının projeleri
export const getUserPostsService = async (
  username: string,
  page = 0,
  size = 5,
) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/posts/user/${username}?page=${page}&size=${size}&sort=createdAt,desc`,
      {
        credentials: "include",
        cache: "no-store",
      },
    );
    return response.json();
  } catch (error) {
    console.error("Kullanıcı projeleri çekilirken hata:", error);
    throw error;
  }
};

export const deletePostService = async (projectId: number) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}`,
      {
        method: "DELETE",
      },
    );
    console.log("Silme işlemi başarılı:", response.status);
    return response.json();
  } catch (error) {
    console.error("Proje silinirken hata oluştu:", error);
    throw error; // Hata durumunda hatayı fırlat
  }
};
