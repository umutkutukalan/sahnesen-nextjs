import BlogsClient from "@/pages/blogs/BlogsClient";
import { getBlogsServer } from "@/services/server/blog.service";

export default async function BlogsPage() {
  const data = await getBlogsServer(0, 5); // İlk sayfa projelerini sunucu tarafında al
  console.log("Server side fetched blogs:", data);

  return (
    <BlogsClient
      initialBlogs={data.content} // İlk başta boş bir dizi veriyoruz, gerçek projeler useGetProjects hook'u tarafından yüklenecek
      initialPage={data.page.number} // İlk başta 0 sayfa veriyoruz, gerçek sayfa sayısı useGetProjects hook'u tarafından yüklenecek
      totalPages={data.page.totalPages} // İlk başta 0 sayfa veriyoruz, gerçek sayfa sayısı useGetProjects hook'u tarafından yüklenecek
    />
  );
}
