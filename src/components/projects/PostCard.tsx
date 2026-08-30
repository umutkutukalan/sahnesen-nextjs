"use client";

import { FiUser, FiEdit3, FiTrash2 } from "react-icons/fi";
import { LuImages, LuNotebookTabs } from "react-icons/lu";
import { TbRosetteDiscountCheckFilled } from "react-icons/tb";
import {
  PiHandsClappingFill,
  PiHandsClappingLight,
  PiNotebookFill,
} from "react-icons/pi";
import { GiCandleFlame } from "react-icons/gi";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { useRelativeTime } from "../../hooks/useRelativeTime";
import { useToProfile } from "@/utils/useToProfile";
import { PostSummaryResponse } from "@/services/server/post.service";
import {
  FaBookBookmark,
  FaHandsClapping,
  FaTicketSimple,
} from "react-icons/fa6";
import { IoMdHeart } from "react-icons/io";
import { CiHeart } from "react-icons/ci";
import {
  BiBookmarks as BiBookmarksIcon,
  BiSolidUserRectangle,
} from "react-icons/bi";
import { useAuth } from "@/context/UserContext";
import { useDeletePosts } from "@/hooks/posts/useDeletePost";
import {
  interactionService,
  PostInteractionStatus,
} from "@/services/client/interaction/interaction.service";
import { IoHeart, IoSparkles } from "react-icons/io5";
import { MdBookmarks, MdCoffee, MdOutlineCoffee } from "react-icons/md";
import { HiOutlineSparkles, HiSparkles } from "react-icons/hi2";
import { RiCupFill, RiQuillPenFill, RiUserSmileFill } from "react-icons/ri";
import { BsCupFill } from "react-icons/bs";
import { SiWikibooks } from "react-icons/si";

interface PostCardProps {
  post: PostSummaryResponse;
  isOwner?: boolean;
  showReadButton?: boolean;
  showActions?: boolean;
  onDelete?: () => void;
}

const PostCard = ({
  post,
  isOwner = false,
  showReadButton = true,
  showActions = false,
  onDelete,
}: PostCardProps) => {
  const { user } = useAuth();
  const { formatRelativeTime } = useRelativeTime();
  const router = useRouter();
  const { ToProfile } = useToProfile();

  const [showConfirm, setShowConfirm] = useState(false);
  const { deletePost } = useDeletePosts();

  // Etkileşim State'leri
  const [interactionStatus, setInteractionStatus] =
    useState<PostInteractionStatus>({
      isLiked: false,
      isShined: false,
      isBookmarked: false,
      likeCount: 0,
      shineCount: 0,
    });

  // Post kartı yüklendiğinde kullanıcının bu post üzerindeki durumunu ve sayıları çek
  useEffect(() => {
    if (!isOwner && user) {
      interactionService
        .getPostInteractionStatus(post.id)
        .then((res) => setInteractionStatus(res))
        .catch((err) => console.error("Etkileşim durumu alınamadı:", err));
    }
  }, [post.id, isOwner, user]);

  // Beğeni Toggle Aksiyonu
  const handleToggleLike = async () => {
    if (!user) return;
    try {
      const res = await interactionService.toggleReaction(post.id, "LIKE");
      setInteractionStatus((prev) => ({
        ...prev,
        isLiked: res.reacted,
        likeCount: res.reacted
          ? prev.likeCount + 1
          : Math.max(0, prev.likeCount - 1),
      }));
    } catch (error) {
      console.error("Beğeni güncellenemedi:", error);
    }
  };

  // Parlat (Shine/Clap) Toggle Aksiyonu
  const handleToggleShine = async () => {
    if (!user) return;
    try {
      const res = await interactionService.toggleReaction(post.id, "SHINE");
      setInteractionStatus((prev) => ({
        ...prev,
        isShined: res.reacted,
        shineCount: res.reacted
          ? prev.shineCount + 1
          : Math.max(0, prev.shineCount - 1),
      }));
    } catch (error) {
      console.error("Parlatma güncellenemedi:", error);
    }
  };

  // Kaydet (Bookmark) Toggle Aksiyonu
  const handleToggleBookmark = async () => {
    if (!user) return;
    try {
      const res = await interactionService.toggleBookmark(post.id);
      setInteractionStatus((prev) => ({
        ...prev,
        isBookmarked: res.bookmarked,
      }));
    } catch (error) {
      console.error("Kaydetme güncellenemedi:", error);
    }
  };

  const handleConfirmDelete = () => {
    deletePost(post?.id, () => {
      onDelete?.();
    });
    setShowConfirm(false);
  };

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  const displayImage = post?.coverImage;
  const finalImageUrl = displayImage
    ? displayImage.startsWith("http")
      ? displayImage
      : `${baseUrl}${displayImage}`
    : null;

  const authorName =
    `${post?.authorName || ""} ${post?.authorSurname || ""}`.trim();

  const authorProfileImgUrl = post?.authorProfileImg
    ? post?.authorProfileImg.startsWith("http")
      ? post?.authorProfileImg
      : `${baseUrl}/${post?.authorProfileImg}`
    : null;

  return (
    <div className="w-full lg:h-[220px] sm:h-[220px] h-[180px] border-b border-gray-100 text-black flex overflow-hidden select-none transition-all duration-300 ease-in-out gap-10">
      {/* SOL GÖRSEL */}
      <div className="h-full flex flex-col justify-center">
        <div className="w-45 h-35 hidden flex-shrink-0 sm:flex items-center justify-center">
          <div className="relative w-full h-full bg-white overflow-hidden flex items-center justify-center border border-gray-100">
            {finalImageUrl ? (
              <Image
                src={finalImageUrl}
                alt={post.title}
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <LuImages className="text-4xl text-gray-300" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SAĞ İÇERİK */}
      <div className="lg:w-4/5 w-3/4 flex-1 h-full flex flex-col justify-center merriweather-sans">
        <div className="flex flex-col gap-4">
          {/* YAZAR BİLGİSİ */}
          <div
            className="flex items-center gap-2 cursor-pointer w-max"
            onClick={() => ToProfile(post.authorUsername)}
          >
            <div className="relative w-5 h-5 rounded-full overflow-hidden border border-gray-200">
              {authorProfileImgUrl ? (
                <Image
                  src={authorProfileImgUrl}
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
              </div>
              <span className="text-[8px]">•</span>
              <span className="text-xs text-gray-500">
                {formatRelativeTime(post?.createdAt)}
              </span>
            </div>
          </div>

          {/* BAŞLIK & SUBTITLE */}
          <div className="flex flex-col gap-2">
            <h2
              onClick={() => {
                if (isOwner) {
                  router.push(`/olustur?slug=${post?.slug}`);
                } else {
                  router.push(`/${post?.authorUsername}/${post?.slug}`);
                }
              }}
              className="text-base sm:text-[22px] line-clamp-2 font-semibold cursor-pointer hover:underline tracking-tight leading-snug"
            >
              {post?.title}
            </h2>

            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
              {post?.subtitle || "İçerik önizlemesi bulunamadı..."}
            </p>
          </div>

          {/* FOOTER & AKSİYONLAR */}
          <div className="mt-3 w-full flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="relative pr-4 border-r border-gray-200">
                <span className="relative z-5">
                  <FaTicketSimple
                    style={{
                      color:
                        post?.postType === "SAHNE"
                          ? "#c86b5a"
                          : post?.postType === "MONOLOG"
                            ? "#66788a"
                            : post?.postType === "YANYANA"
                              ? "#789680"
                              : post?.postType === "TERSYUZ"
                                ? "#fdfd96"
                                : "#000000",
                    }}
                  />
                </span>
                <span className="absolute z-0 top-0 left-1 rotate-30">
                  <FaTicketSimple
                    style={{
                      color:
                        post?.postType === "SAHNE"
                          ? "#c86b5a"
                          : post?.postType === "MONOLOG"
                            ? "#66788a"
                            : post?.postType === "YANYANA"
                              ? "#789680"
                              : post?.postType === "TERSYUZ"
                                ? "#fdfd96"
                                : "#000000",
                    }}
                  />
                </span>
              </div>

              {/* EĞER showReadButton true ise VEYA sahibi DEĞİLSE "Perdeyi Arala" gösterilir */}
              {(showReadButton || !isOwner) && (
                <button
                  onClick={() =>
                    router.push(`/${post?.authorUsername}/${post?.slug}`)
                  }
                  className="text-gray-600 hover:text-gray-900 transition cursor-pointer"
                >
                  <span className="text-[10px] font-medium">Perdeyi Arala</span>
                </button>
              )}
            </div>

            {/* SAHİBİ İSE DÜZENLE/SİL, DEĞİLSE ETKİLEŞİMLERİ GÖSTER */}
            {isOwner ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push(`/olustur?slug=${post.slug}`)}
                  className="flex items-center gap-1 text-gray-600 hover:text-black transition cursor-pointer"
                >
                  <FiEdit3 className="text-sm" />
                  <span className="text-xs">Düzenle</span>
                </button>
                <button
                  onClick={() => setShowConfirm(true)}
                  className="flex items-center gap-1 text-red-500 hover:text-red-700 transition cursor-pointer"
                >
                  <FiTrash2 className="text-sm" />
                  <span className="text-xs">Sil</span>
                </button>
              </div>
            ) : (
              <ul className="flex items-center gap-2">
                {/* LIKE */}
                {/* <li
                  onClick={handleToggleLike}
                  className={`hidden sm:flex items-center gap-1 cursor-pointer hover:opacity-80 transition`}
                >
                  <IoHeart
                    className={`text-base ${interactionStatus.isLiked ? "text-red-600" : ""}`}
                  />

                  <span>
                    {interactionStatus.likeCount >= 1000
                      ? `${Math.floor(interactionStatus.likeCount / 100) / 10}K`
                      : interactionStatus.likeCount}
                  </span>
                </li> */}

                {/* SHINE (PARLAT) */}
                <li
                  onClick={handleToggleShine}
                  className={`hidden sm:flex items-center gap-1 cursor-pointer hover:opacity-80 transition-all duration-300`}
                >
                  {post.postType === "SAHNE" ? (
                    <FaHandsClapping
                      className={`text-base`}
                      style={{
                        color: interactionStatus.isShined ? "#c86b5a" : "",
                      }}
                    />
                  ) : post.postType === "MONOLOG" ? (
                    <RiQuillPenFill
                      className={`text-base`}
                      style={{
                        color: interactionStatus.isShined ? "#66788a" : "",
                      }}
                    />
                  ) : post.postType === "YANYANA" ? (
                    <>
                      {interactionStatus.isShined ? (
                        // Basıldığında: DOLU İKON + Mod Rengi (Yeşil/Terracotta)
                        <MdCoffee
                          className="text-base"
                          style={{ color: "#789680" }}
                        />
                      ) : (
                        // Basılmadığında: BOŞ İKON + Varsayılan Soluk Renk (Hover'da koyulaşır)
                        <MdOutlineCoffee className="text-base text-neutral-400 hover:text-neutral-600" />
                      )}
                    </>
                  ) : (
                    <RiUserSmileFill
                      className={`text-base`}
                      style={{
                        color: interactionStatus.isShined ? "#fdfd96" : "",
                      }}
                    />
                  )}

                  {/* <span>
                    {interactionStatus.shineCount >= 1000
                      ? `${Math.floor(interactionStatus.shineCount / 100) / 10}K`
                      : interactionStatus.shineCount}
                  </span> */}
                </li>

                {/* BOOKMARK (KAYDET) */}
                <li
                  onClick={handleToggleBookmark}
                  className={`hidden sm:flex items-center gap-1 cursor-pointer hover:opacity-80 transition ${
                    interactionStatus.isBookmarked
                      ? "text-blue-600 font-semibold"
                      : ""
                  }`}
                >
                  <SiWikibooks className="text-base" />
                </li>
              </ul>
            )}
          </div>

          {/* SİLME ONAY MODALI */}
          {showConfirm && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-xs z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col gap-4 max-w-sm w-full mx-4">
                <span className="font-medium text-gray-800">
                  Bu sahneyi silmek istediğinize emin misiniz?
                </span>
                <div className="flex gap-3 justify-end">
                  <button
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-md hover:bg-gray-200 cursor-pointer"
                    onClick={() => setShowConfirm(false)}
                  >
                    Vazgeç
                  </button>
                  <button
                    className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 cursor-pointer"
                    onClick={handleConfirmDelete}
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
