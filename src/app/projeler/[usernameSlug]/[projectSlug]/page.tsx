import Detail from "@/components/detail/Detail";
import { getProjectBySlug } from "@/services/server/project.service";

interface PageProps {
  params: Promise<{
    usernameSlug: string;
    projectSlug: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { usernameSlug, projectSlug } = await params;

  console.log("Fetching project with:", { usernameSlug, projectSlug });

  const project = await getProjectBySlug(usernameSlug, projectSlug);

  if (!project) {
    return (
      <div className="page flex items-center justify-center">
        <p>Proje bilgisi bulunamadı.</p>
      </div>
    );
  }

  return <Detail project={project} />;
}
