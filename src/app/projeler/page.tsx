import ProjectsClient from "@/pages/projects/ProjectsClient";
import { getProjectsServer } from "@/services/server/project.service";

export default async function ProjectsPage() {
  const data = await getProjectsServer(0, 5); // İlk sayfa projelerini sunucu tarafında al
  console.log("Server side fetched projects:", data);

  return (
    <ProjectsClient
      initialProjects={data.content} // İlk başta boş bir dizi veriyoruz, gerçek projeler useGetProjects hook'u tarafından yüklenecek
      initialPage={data.page.number} // İlk başta 0 sayfa veriyoruz, gerçek sayfa sayısı useGetProjects hook'u tarafından yüklenecek
      totalPages={data.page.totalPages} // İlk başta 0 sayfa veriyoruz, gerçek sayfa sayısı useGetProjects hook'u tarafından yüklenecek
    />
  );
}
