const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export function getFullImageUrl(imagePath?: string | null): string | null {
  if (!imagePath) return null;

  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  // Çift slash (//) oluşmasını engellemek için temizlik
  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;

  return `${cleanBase}${cleanPath}`;
}
