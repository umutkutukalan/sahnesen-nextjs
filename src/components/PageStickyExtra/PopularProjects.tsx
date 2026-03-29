"use client";

import { FaStar, FaStarHalf } from "react-icons/fa";
import { useRelativeTime } from "../../hooks/useRelativeTime";
import { handleViewProject } from "../../utils/HandleViewProject";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { TbRosetteDiscountCheckFilled } from "react-icons/tb";
import { useToProfile } from "@/utils/useToProfile";
// import { useToProfile } from "../../hooks/useToProfile";

const PopularProjects = ({ projects }) => {
  const { formatRelativeTime } = useRelativeTime();
  const router = useRouter();
  const { ToProfile } = useToProfile();
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
            <div className="flex items-center gap-2 cursor-pointer"
              onClick={() => {
                if (project?.user) {
                  ToProfile(project?.user, project.user?.username);
                } else {
                  ToProfile(project?.user, project.user?.username);
                }
              }}
            >
              <div
                className="relative w-8 h-8 bg-gray-300 rounded-full overflow-hidden flex-shrink-0 cursor-pointer shadow-lg shadow-black/20"
              // onClick={() => ToProfile(project?.user, project?.user?.username)}
              >
                <Image
                  src={project.user.profileImg}
                  alt={project.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="truncate">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <span className="truncate">
                      {project.user.name || project.user.email} {project.user.surname}
                    </span>
                    <TbRosetteDiscountCheckFilled
                      className="text-blue-500 shrink-0"
                      title="Onaylı Yazar"
                    />
                  </div>
                  <span className="truncate text-[8px] text-gray-400">
                    @{project.user.username}
                  </span>
                </div>
              </div>
            </div>
            <div
              className="flex flex-col gap-1 cursor-pointer"
              onClick={() =>
                handleViewProject(
                  project,
                  router,
                  project?.user?.username,
                  project?.slug,
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
