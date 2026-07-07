// services/server/project.service.ts

export interface PostResponse {
  id: number;
  title: string;
  slug: string;
  content: string; // Backend'den Stringified JSON string geliyor
  coverImage?: string;
  postType: "SAHNE" | "MONOLOG" | "YANYANA" | "TERSYUZ";
  createdAt: string;
  viewCount?: number; // Redis'ten beslenen sayaç alanı
  authorName: string;
  authorSurname: string;
  authorUsername: string;
  authorProfileImg?: string;
}

// 1. Genel Akış (Ana sayfa / Projeler & Bloglar ortak akışı)
export const getPublishedPostsServer = async (page = 0, size = 5) => {
  const apiUrl = process.env.API_URL || 'http://localhost:8080';
  
  // Backend'deki genel yayındaki postları getiren endpoint
  const res = await fetch(
    `${apiUrl}/api/posts?page=${page}&size=${size}&sort=createdAt,desc`,
    {
      cache: "no-store", // Akışın her zaman güncel kalması için
    }
  );

  if (!res.ok) {
    throw new Error("Sahne akışı yüklenirken bir hata oluştu");
  }

  return res.json(); // Spring Boot tarafındaki Page<PostResponse> nesnesini döner
};

// 2. Slug ile Detay Getirme (Redis + Canlı Sayaç Entegrasyonu)
export const getPostDetailServer = async (slug: string): Promise<PostResponse | null> => {
  const apiUrl = process.env.API_URL || 'http://localhost:8080';
  
  // Backend'de yazdığımız getPostWithViewCount metodunu tetikleyen endpoint
  const res = await fetch(
    `${apiUrl}/api/posts/${slug}`,
    {
      cache: "no-store", 
    }
  );

  if (!res.ok) {
    return null;
  }

  return res.json();
};
