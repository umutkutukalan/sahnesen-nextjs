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

  return (
    <div className="flex flex-col gap-4 mt-1">
      <div className="flex items-center gap-1" style={{ fontSize: "0.8rem" }}>
        <FaStar className="flex-shrink-0 text-blue-600" />
        <h3>Popüler İçerikler</h3> {/* İsim genel akışa göre güncellendi */}
      </div>
      
      <ul className="flex flex-col gap-5">
        {topProjects.map((project) => {
          // Yazar ismini güvenli bir şekilde birleştiriyoruz
          const authorName = `${project.authorName || ""} ${project.authorSurname || ""}`.trim();

          return (
            <li key={project.id} className="flex flex-col gap-3 text-xs">
              
              {/* AUTHOR HEADER */}
              <div 
                className="flex items-center gap-2 cursor-pointer w-max"
                onClick={() => ToProfile(null, project.authorUsername)} // Doğrudan authorUsername
              >
                <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 shadow-lg shadow-black/20">
                  {project.authorProfileImg ? (
                    <Image
                      src={project.authorProfileImg}
                      alt={project.title}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <FiUser className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="truncate">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <span className="truncate">{authorName || "Yazar"}</span>
                      <TbRosetteDiscountCheckFilled className="text-blue-500 shrink-0" title="Onaylı Yazar" />
                    </div>
                    <span className="truncate text-[8px] text-gray-400">
                      @{project.authorUsername}
                    </span>
                  </div>
                </div>
              </div>

              {/* TITLE + TIME */}
              <div
                className="flex flex-col gap-1 cursor-pointer"
                onClick={() => router.push(`/kesfet/${project.authorUsername}/${project.slug}`)} // Yeni şık rota mantığımız
              >
                <span
                  className="pr-10 line-clamp-2 font-semibold hover:text-blue-600 transition-colors duration-200"
                  style={{ fontSize: "0.8rem" }}
                >
                  {project.title}
                </span>
                <div className="flex items-center gap-1 text-gray-400">
                  <FaStarHalf className="flex-shrink-0 text-blue-600 text-[10px]" />
                  <span>{formatRelativeTime(project.createdAt)}</span>
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
