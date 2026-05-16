import ProjectsClient from "@/pages/projects/ProjectsClient";
import { getPublishedPostsServer } from "@/services/server/post.service";


export default async function Page() {
  const data = await getPublishedPostsServer(0, 5); // İlk sayfa projelerini sunucu tarafında al
  console.log("Server side fetched projects:", data);

  return (
    <ProjectsClient
      initialProjects={data.content || []} // İlk başta boş bir dizi veriyoruz, gerçek projeler useGetProjects hook'u tarafından yüklenecek
      initialPage={data.page.number ?? 0} // İlk başta 0 sayfa veriyoruz, gerçek sayfa sayısı useGetProjects hook'u tarafından yüklenecek
      totalPages={data.page.totalPages ?? 0} // İlk başta 0 sayfa veriyoruz, gerçek sayfa sayısı useGetProjects hook'u tarafından yüklenecek
    />
  );
}
