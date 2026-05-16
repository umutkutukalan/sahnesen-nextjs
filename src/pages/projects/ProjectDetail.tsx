import Detail from "@/components/detail/Detail";
import { getProjectBySlug } from "@/services/server/post.service";

export interface ProjectDetailProps {
  params: {
    usernameSlug: string;
    projectSlug: string;
  };
}
const ProjectDetail = async ({ params }: ProjectDetailProps) => {
  const project = await getProjectBySlug(
    params.usernameSlug,
    params.projectSlug,
  );

  if (!project) {
    return (
      <div className="page flex items-center justify-center">
        <p>Proje bilgisi bulunamadı.</p>
      </div>
    );
  }

  return <Detail project={project} />;
};

export default ProjectDetail;
