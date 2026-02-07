"use client";

import { FaStar, FaStarHalf } from "react-icons/fa";
import { useRelativeTime } from "../../hooks/useRelativeTime";
import { handleViewProject } from "../../utils/HandleViewProject";
import Image from "next/image";
import { useRouter } from "next/navigation";
// import { useToProfile } from "../../hooks/useToProfile";

const PopularProjects = ({ projects }) => {
  const { formatRelativeTime } = useRelativeTime();
  const router = useRouter();
  // const { ToProfile } = useToProfile();
  console.log(projects);
  const topProjects = projects.slice(0, 4);
  return (
    <div className="flex flex-col gap-4 mt-1">
      <div
        className="flex items-center gap-1"
        style={{
          fontSize: "0.8rem",
        }}
      >
        <FaStar className="flex-shrink-0 text-blue-600" />
        <h3>Popüler Projeler</h3>
      </div>
      <ul className="flex flex-col gap-5">
        {topProjects.map((project) => (
          <li key={project.id} className="flex flex-col gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div
                className="relative w-7 h-7 bg-gray-300 bg-gray-300 rounded-full overflow-hidden flex-shrink-0 cursor-pointer"
                // onClick={() => ToProfile(project?.user, project?.user?.username)}
              >
                <Image
                  src={project.user.profileImg}
                  alt={project.title}
                  fill
                  className="object-cover"
                />
              </div>
              <span
                className="cursor-pointer hover:underline"
                // onClick={() =>
                //   ToProfile(project?.user, project?.user?.username)
                // }
              >
                {project.user.name} {project.user.surname}
              </span>
            </div>
            <div
              className="flex flex-col gap-1 cursor-pointer"
              onClick={() =>
                handleViewProject(
                  project,
                  router,
                  project.user.name,
                  project.title,
                )
              }
            >
              <span
                className="pr-10 line-clamp-2 font-semibold"
                style={{
                  fontSize: "0.8rem",
                }}
              >
                {project.title}
              </span>
              <div className="flex items-center">
                <FaStarHalf className="flex-shrink-0 text-blue-600" />
                <span className="text-gray-500">
                  {formatRelativeTime(project.createdAt)}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PopularProjects;
