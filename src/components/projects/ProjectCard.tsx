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
import { useToProfile } from "@/utils/useToProfile";
import { PostResponse } from "@/services/server/post.service";

interface ProjectCardProps {
  project: PostResponse; // Tip adını yeni post mimarisine çektik
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const { formatRelativeTime } = useRelativeTime();
  const router = useRouter();
  const { ToProfile } = useToProfile();
  const { hasUserLiked, liked } = useHasUserLiked();
  const { likeCount, getLikeCount } = useGetLikeCount();

  useEffect(() => {
    hasUserLiked(project.id, "project");
    getLikeCount(project.id, "project");
  }, [project?.id]);

  // TİPTAP METİN ÇIKARMA SİHİRBAZI (Helper Metot)
  const getFirstParagraphText = (contentStr: string): string => {
    try {
      if (!contentStr) return "";
      
      // 1. Aşama: Backend'den gelen String'i gerçek JSON nesnesine çeviriyoruz
      const parsed = JSON.parse(contentStr);
      
      // 2. Aşama: Tiptap hiyerarşisinde (doc -> content -> paragraph) geziyoruz
      if (parsed && parsed.content && Array.isArray(parsed.content)) {
        // İlk paragraf düğümünü bul
        const paragraphNode = parsed.content.find((node: any) => node.type === "paragraph");
        
        // Paragrafın içindeki text düğümlerini birleştir
        if (paragraphNode && paragraphNode.content && Array.isArray(paragraphNode.content)) {
          return paragraphNode.content
            .map((textNode: any) => textNode.text || "")
            .join("");
        }
      }
      return "";
    } catch (e) {
      console.error("Tiptap JSON parse hatası:", e);
      return "";
    }
  };

  // Yeni backend mimarimizde yazarı doğrudan düzleştirilmiş (flat) olarak alıyoruz
  const authorName = `${project.authorName || ""} ${project.authorSurname || ""}`.trim();

  return (
    <div className="w-full lg:h-[240px] sm:h-[220px] h-[180px] border-b border-gray-200 text-black flex overflow-hidden select-none hover:shadow-lg hover:rounded-lg transition-all duration-300 ease-in-out gap-5 px-5">
      
      {/* LEFT IMAGE */}
      <div className="lg:w-1/5 sm:w-1/4 w-1/5 hidden rounded-lg flex-shrink-0 sm:flex items-center justify-center">
        <div
          className={`relative w-full lg:h-50 sm:h-40 bg-white rounded-lg overflow-hidden flex items-center justify-center ${
            project.coverImage ? "" : "border border-gray-100 shadow-sm" // image -> coverImage oldu
          }`}
          style={{ boxShadow: "10px 10px 10px 0px rgba(0,0,0,0.5)" }}
        >
          {project.coverImage ? (
            <Image
              src={project.coverImage}
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
      <div className="lg:w-4/5 w-3/4 w-full h-full flex flex-col justify-between sm:px-4 lg:py-6 py-5">
        
        {/* AUTHOR */}
        <div 
          className="flex items-center gap-2 cursor-pointer w-max"
          onClick={() => ToProfile(null, project.authorUsername)} // Doğrudan authorUsername'e yönlendiriyoruz
        >
          <div className="relative w-8 h-8 rounded-full overflow-hidden shadow-lg shadow-black/20">
            {project.authorProfileImg ? (
              <Image
                src={project.authorProfileImg}
                alt="avatar"
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <FiUser className="w-full h-full p-1 text-gray-400" />
            )}
          </div>

          <div className="truncate">
            <div className="flex flex-col">
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <span className="truncate">{authorName || "Yazar"}</span>
                <TbRosetteDiscountCheckFilled className="text-blue-500 shrink-0" title="Onaylı Yazar" />
              </div>
              <span className="truncate text-[8px] text-gray-400">@{project.authorUsername}</span>
            </div>
          </div>
        </div>

        {/* TITLE + CONTENT */}
        <div className="mt-2">
          <h2 className="text-base sm:text-lg font-semibold line-clamp-2">
            {project.title}
          </h2>

          {/* Tiptap string'ini buraya besliyoruz */}
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
            {getFirstParagraphText(project.content) || "İçerik önizlemesi bulunamadı..."}
          </p>
        </div>

        {/* FOOTER */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span>{formatRelativeTime(project.createdAt)}</span>
            <div className="hidden sm:flex items-center gap-1">
              {liked ? <IoMdHeart className="text-red-600 text-sm" /> : <CiHeart className="text-red-600 text-sm" />}
              <span>{likeCount >= 1000 ? `${Math.floor(likeCount / 100) / 10}K` : likeCount}</span>
            </div>
          </div>

          <button
            onClick={() => router.push(`/${project.authorUsername}/${project.slug}`)} // Yeni şık rota mantığımız
            className="text-gray-600 hover:text-gray-900 transition cursor-pointer"
          >
            Okumaya Devam Et
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProjectCard;
