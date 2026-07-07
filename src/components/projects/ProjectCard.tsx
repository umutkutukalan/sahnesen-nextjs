"use client";

import { FiUser } from "react-icons/fi";
import { LuImages, LuTheater } from "react-icons/lu";
import { CiHeart } from "react-icons/ci";
import { IoMdHeart } from "react-icons/io";
import { TbRosetteDiscountCheckFilled, TbTheater } from "react-icons/tb";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { useRelativeTime } from "../../hooks/useRelativeTime";
import { useGetLikeCount } from "@/hooks/likes/useGetLikeCount";
import { useHasUserLiked } from "@/hooks/likes/useHasUserLiked";
import { useToProfile } from "@/utils/useToProfile";
import { PostResponse } from "@/services/server/post.service";
import { FaTicketSimple } from "react-icons/fa6";
import { MdCurtainsClosed } from "react-icons/md";

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

  // 🔥 AKILLI TIPTAP METİN ÇIKARMA SİHİRBAZI
  const getFirstParagraphText = (contentStr: string): string => {
    try {
      if (!contentStr) return "";
      const parsed = JSON.parse(contentStr);

      if (parsed && parsed.content && Array.isArray(parsed.content)) {
        // Sadece paragraf değil, yazı içeren ilk anlamlı bloku buluyoruz (paragraf, heading, veya blockquote)

        const textBearingNode = parsed.content.find(
          (node: any) =>
            (node.type === "paragraph" ||
              (node.type === "dropcap" && node.attrs?.letter) ||
              (node.type === "heading" && node.attrs?.level !== 1) ||
              node.type === "blockquote") &&
            node.content &&
            node.content.length > 0,
        );

        if (textBearingNode) {
          // 2. SİHİRLİ REKÜRSİF FONKSİYON: Node ne kadar derinde olursa olsun tüm metni kazır
          const extractText = (node: any): string => {
            // Eğer doğrudan text node ise metni dön
            if (node.type === "text") {
              return node.text || "";
            }
            // Eğer inline bir dropcap ise harfi dön
            if (node.type === "dropcap" && node.attrs?.letter) {
              return node.attrs.letter;
            }
            // Eğer alt node'ları (children) varsa, hepsini derinlemesine tara ve birleştir
            if (node.content && Array.isArray(node.content)) {
              return node.content.map(extractText).join("");
            }
            return "";
          };

          return extractText(textBearingNode);
        }
      }
      return "";
    } catch (e) {
      console.error("Tiptap JSON parse hatası (Card):", e);
      return "";
    }
  };

  // 🔥 TIPTAP İÇİNDEKİ İLK GÖRSELİ BULMA SİHİRBAZI
  const getFirstImageSrc = (contentStr: string): string | null => {
    try {
      if (!contentStr) return null;
      const parsed = JSON.parse(contentStr);

      if (parsed && parsed.content && Array.isArray(parsed.content)) {
        for (const node of parsed.content) {
          // 1. İhtimal: Resim doğrudan ana blok olarak eklenmişse
          if (node.type === "image" && node.attrs?.src) {
            return node.attrs.src;
          }

          // 2. İhtimal: Resim bir paragrafın veya başka bir bloğun içine çocuk node olarak gömülmüşse
          if (node.content && Array.isArray(node.content)) {
            const inlineImage = node.content.find(
              (child: any) => child.type === "image",
            );
            if (inlineImage && inlineImage.attrs?.src) {
              return inlineImage.attrs.src;
            }
          }
        }
      }
      return null;
    } catch (e) {
      console.error("Tiptap kapak resmi ayıklama hatası (Card):", e);
      return null;
    }
  };

  // Kullanımı tetikleyeceğimiz değişken: Öncelik coverImage, yoksa içerikteki ilk resim
  const displayImage = project.coverImage || getFirstImageSrc(project.content);
  const finalImageUrl = displayImage
    ? displayImage.startsWith("http")
      ? displayImage
      : `http://localhost:8080${displayImage}`
    : null;

  // Yeni backend mimarimizde yazarı doğrudan düzleştirilmiş (flat) olarak alıyoruz
  const authorName =
    `${project.authorName || ""} ${project.authorSurname || ""}`.trim();

  return (
    <div className="w-full lg:h-[240px] sm:h-[220px] h-[180px] border-b border-gray-100 text-black flex overflow-hidden select-none transition-all duration-300 ease-in-out gap-10">
      {/* LEFT IMAGE */}
      {/* <div className="lg:w-1/5 sm:w-1/4 w-1/5 hidden rounded-lg flex-shrink-0 sm:flex items-center justify-center">
        <div
          className={`relative w-full lg:h-50 sm:h-40 bg-white rounded-lg overflow-hidden flex items-center justify-center ${
            finalImageUrl
              ? "border border-gray-200"
              : "border border-gray-100 shadow-sm"
          }`}
        >
          {finalImageUrl ? (
            <Image
              src={finalImageUrl}
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
      </div> */}

      {/* RIGHT CONTENT */}
      <div className="lg:w-4/5 w-3/4 w-full h-full flex flex-col justify-between lg:py-6 py-5">
        {/* TITLE + CONTENT */}
        <div className="mt-2 flex flex-col gap-4">
          {/* AUTHOR */}
          <div
            className="flex items-center gap-2 cursor-pointer w-max"
            onClick={() => ToProfile(null, project.authorUsername)} // Doğrudan authorUsername'e yönlendiriyoruz
          >
            <div className="relative w-5 h-5 rounded-full overflow-hidden border border-gray-200">
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
              <span className="text-[8px]">•</span>
              <span className="text-[10px] text-gray-500">
                {formatRelativeTime(project.createdAt)}
              </span>
            </div>
          </div>

          {/* Title & Content */}
          <div className="flex flex-col gap-1">
            <h2 className="text-base sm:text-xl font-semibold line-clamp-2">
              {project.title}
            </h2>

            {/* Tiptap string'ini buraya besliyoruz */}
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
              {getFirstParagraphText(project.content) ||
                "İçerik önizlemesi bulunamadı..."}
            </p>
          </div>

          {/* FOOTER */}
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="relative pr-4 border-r border-gray-200">
                <span className="relative z-5">
                  <FaTicketSimple
                    className={`${
                      project.postType === "SAHNE"
                        ? "text-[#faf8f6]"
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
                <span className="absolute left-2 -top-0.5 rotate-15 z-10">
                  <FaTicketSimple
                    className={`${
                      project.postType === "SAHNE"
                        ? "text-[#faf8f6]"
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
              {/* <button
                onClick={() =>
                  router.push(`/${project.authorUsername}/${project.slug}`)
                } // Yeni şık rota mantığımız
                className="text-gray-600 hover:text-gray-900 transition cursor-pointer"
              >
                <div className="flex items-start gap-1">
                  <LuTheater className="text-sm text-[#d80104]" />
                  <span className="text-[10px]">Perdeyi Arala</span>
                </div>
              </button> */}
              {/* <div className="hidden sm:flex items-center gap-1">
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
            </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT IMAGE */}
      <div className="h-full flex flex-col justify-center">
        <div className="w-45 h-30 hidden flex-shrink-0 sm:flex items-center justify-center">
          {" "}
          <div
            className={`relative w-full h-full bg-white overflow-hidden flex items-center justify-center ${
              finalImageUrl ? "" : ""
            }`}
          >
            {finalImageUrl ? (
              <Image
                src={finalImageUrl}
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
      </div>
    </div>
  );
};

export default ProjectCard;
