export const searchTagsClient = async (query: string): Promise<string[]> => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/posts/tags/autocomplete?query=${encodeURIComponent(query)}`,
      { cache: "no-store" },
    );

    if (!res.ok) {
      console.error("Etiket arama HTTP hatası:", res.status);
      return [];
    }

    const data = await res.json();

    if (Array.isArray(data)) {
      return data.map((item: any) =>
        typeof item === "object" && item !== null ? item.name : item,
      );
    }

    return [];
  } catch (error) {
    console.error("Etiket arama hatası:", error);
    return [];
  }
};
