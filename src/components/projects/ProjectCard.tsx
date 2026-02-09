"use client";

import { FiUser } from "react-icons/fi";
import { LuImages } from "react-icons/lu";
import { CiHeart } from "react-icons/ci";
import { IoMdHeart } from "react-icons/io";
import { TbRosetteDiscountCheckFilled } from "react-icons/tb";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { useRelativeTime } from "../../hooks/useRelativeTime";
import { handleViewProject } from "../../utils/HandleViewProject";
import { useGetLikeCount } from "@/hooks/likes/useGetLikeCount";
import { useHasUserLiked } from "@/hooks/likes/useHasUserLiked";
import { Project } from "@/services/server/project.service";

interface ProjectCardProps {
  project: Project;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const { formatRelativeTime } = useRelativeTime();
  const router = useRouter();
  const { hasUserLiked, liked } = useHasUserLiked();
  const { likeCount, getLikeCount } = useGetLikeCount();

  useEffect(() => {
    hasUserLiked(project.id, "project");
    getLikeCount(project.id, "project");
  }, [project?.id]);

  const author = project.user;

  return (
    <div className="w-full sm:h-[220px] h-[180px] border-b border-gray-200 text-black flex overflow-hidden select-none hover:shadow-lg hover:rounded-lg transition-all duration-300 ease-in-out gap-5 px-5">
      {/* LEFT IMAGE */}
      <div className="lg:w-1/5 sm:w-1/4 w-1/5 hidden rounded-lg overflow-hidden flex-shrink-0 sm:flex items-center justify-center">
        <div
          className={`relative w-full lg:h-50 sm:h-40 bg-white rounded-lg overflow-hidden flex items-center justify-center ${
            project.image ? "" : "border border-gray-100 shadow-sm"
          }`}
        >
          {project.image ? (
            <Image
              src={project.image}
              alt={project.title}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <LuImages className="text-4xl text-gray-300" />
            </div>
          )}
        </div>
      </div>

      {/* RIGHT CONTENT */}
      <div className="lg:w-4/5 w-3/4 w-full h-full flex flex-col justify-between sm:px-4 py-5">
        {/* AUTHOR */}
        <div className="flex items-center gap-2">
          <div className="relative w-6 h-6 rounded-full overflow-hidden border">
            {author?.profileImg ? (
              <Image
                src={author.profileImg}
                alt="avatar"
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <FiUser className="w-full h-full p-1 text-gray-400" />
            )}
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-600 truncate">
            <span className="truncate">
              {author?.name || author?.email} {author?.surname}
            </span>
            <TbRosetteDiscountCheckFilled
              className="text-blue-500 shrink-0"
              title="Onaylı Yazar"
            />
          </div>
        </div>

        {/* TITLE + CONTENT */}
        <div className="mt-2">
          <h2 className="text-base sm:text-lg font-semibold line-clamp-2">
            {project.title}
          </h2>

          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
            {project.content.find((item) => item.type === "paragraph")?.value}
          </p>
        </div>

        {/* FOOTER */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span>{formatRelativeTime(project.createdAt)}</span>

            <div className="hidden sm:flex items-center gap-1">
              {liked ? (
                <IoMdHeart className="text-red-600 text-sm" />
              ) : (
                <CiHeart className="text-red-600 text-sm" />
              )}
              <span>
                {likeCount >= 1000
                  ? `${Math.floor(likeCount / 100) / 10}K`
                  : likeCount}
              </span>
            </div>
          </div>

          <button
            onClick={() =>
              handleViewProject(
                project,
                router,
                author?.username,
                project.title,
              )
            }
            className="text-gray-600 hover:text-gray-900 transition"
          >
            Okumaya Devam Et
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
