import { Project } from "@/services/server/project.service";

interface DetailProps {
  project: Project;
}

const Detail = ({ project }: DetailProps) => {
  return (
    <div>
      <h1>{project.title}</h1>
      {/* içerik */}
    </div>
  );
};

export default Detail;
