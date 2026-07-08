"use client";

import { FaStar, FaStarHalf } from "react-icons/fa";
import { useRelativeTime } from "../../hooks/useRelativeTime";
import { handleViewProject } from "../../utils/HandleViewProject";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { TbRosetteDiscountCheckFilled } from "react-icons/tb";
import { useToProfile } from "@/utils/useToProfile";
import { PostResponse } from "@/services/server/post.service";
import { FiUser } from "react-icons/fi";
import { FaTicketSimple } from "react-icons/fa6";
// import { useToProfile } from "../../hooks/useToProfile";

interface PopularProjectsProps {
  projects: PostResponse[]; // Tip dizisi güncellendi
}

const PopularProjects = ({ projects }: PopularProjectsProps) => {
  const { formatRelativeTime } = useRelativeTime();
  const router = useRouter();
  const { ToProfile } = useToProfile();

  console.log("Popular projects data:", projects);
  const topProjects = projects.slice(0, 4);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-1" style={{ fontSize: "0.8rem" }}>
        {/* <FaStar className="flex-shrink-0 text-blue-600" /> */}
        <h3 className="text-sm font-semibold">Popüler İçerikler</h3>{" "}
        {/* İsim genel akışa göre güncellendi */}
      </div>

      <ul className="flex flex-col gap-5">
        {topProjects.map((project) => {
          // Yazar ismini güvenli bir şekilde birleştiriyoruz
          const authorName =
            `${project.authorName || ""} ${project.authorSurname || ""}`.trim();

          return (
            <li key={project.id} className="flex flex-col gap-2 text-xs">
              {/* AUTHOR HEADER */}
              <div
                className="flex items-center gap-2 cursor-pointer w-max"
                onClick={() => ToProfile(null, project.authorUsername)} // Doğrudan authorUsername
              >
                <div className="relative w-5 h-5 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
                  {project.authorProfileImg ? (
                    <Image
                      src={`${baseUrl}/${project.authorProfileImg}`}
                      alt={project.title}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiUser className="w-full h-full p-1 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="truncate flex items-center gap-1">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <span className="truncate">{authorName || "Yazar"}</span>
                      <TbRosetteDiscountCheckFilled
                        className="text-blue-500 shrink-0 text-xs"
                        title="Onaylı Yazar"
                      />
                    </div>
                    {/* <span className="truncate text-[10px] text-gray-400">
                  @{project.authorUsername}
                </span> */}
                  </div>
                </div>
              </div>

              {/* TITLE + TIME */}
              <div
                className="flex flex-col gap-2 cursor-pointer"
                onClick={() =>
                  router.push(`/${project.authorUsername}/${project.slug}`)
                } // Yeni şık rota mantığımız
              >
                <span className="line-clamp-2 font-semibold hover:text-blue-600 transition-colors duration-200 text-sm">
                  {project.title}
                </span>
                <div className="flex items-center gap-1 mt-1">
                  <div className="flex items-center gap-1 text-gray-400">
                    <FaStarHalf className="flex-shrink-0 text-blue-600 text-[10px]" />
                    <span className="text-[10px]">
                      {formatRelativeTime(project.createdAt)}
                    </span>
                  </div>
                  <span className="text-[8px]">•</span>
                  <div className="relative pr-4">
                    <span className="relative z-5 text-[10px]">
                      <FaTicketSimple
                        className={`${
                          project.postType === "SAHNE"
                            ? "text-black"
                            : project.postType === "MONOLOG"
                              ? "text-[#f3c102]"
                              : project.postType === "YANYANA"
                                ? "text-[#fa9ec1]"
                                : project.postType === "TERSYUZ"
                                  ? "text-[#94c5fd]"
                                  : "text-black"
                        }`}
                      />
                    </span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PopularProjects;
