import ProjectDetail from "@/pages/projects/ProjectDetail";
import { getProjectBySlug } from "@/services/server/project.service";

interface Props {
  params: {
    usernameSlug: string;
    projectSlug: string;
  };
}

export default async function Page({ params }: Props) {
  const { usernameSlug, projectSlug } = params;

  const project = await getProjectBySlug(usernameSlug, projectSlug);

  return <ProjectDetail project={project} />;
}
