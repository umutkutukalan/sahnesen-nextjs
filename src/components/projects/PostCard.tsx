"use client";

import { FiUser, FiMoreHorizontal } from "react-icons/fi";
import { LuImages, LuPenLine, LuTheater } from "react-icons/lu";
import {
  TbBookmark,
  TbBookmarkFilled,
  TbRosetteDiscountCheckFilled,
} from "react-icons/tb";
import {
  PiFeather,
  PiFeatherFill,
  PiHandsClappingDuotone,
  PiHandsClappingFill,
} from "react-icons/pi";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { useRelativeTime } from "../../hooks/useRelativeTime";
import { useToProfile } from "@/utils/useToProfile";
import { PostSummaryResponse } from "@/services/server/post.service";
import { FaTicketSimple } from "react-icons/fa6";
import { useAuth } from "@/context/UserContext";
import { useDeletePosts } from "@/hooks/posts/useDeletePost";
import { ReactionType } from "@/services/client/interaction/interaction.service";
import { MdCoffee, MdOutlineCoffee } from "react-icons/md";
import { RiUserSmileFill, RiUserSmileLine } from "react-icons/ri";
import { usePostInteraction } from "@/hooks/interaction/usePostInteraction";
import { IoHeartOutline, IoHeartSharp } from "react-icons/io5";
import SaveToCollectionModal from "../collections/SaveToCollectionModal";

interface PostCardProps {
  post: PostSummaryResponse & { isArchived?: boolean; archived?: boolean };
  isOwner?: boolean;
  showReadButton?: boolean;
  showActions?: boolean;
  onDelete?: () => void;
  onArchive?: () => void;
}

const PostCard = ({
  post,
  isOwner = false,
  showReadButton = true,
  showActions = false,
  onDelete,
  onArchive,
}: PostCardProps) => {
  const { user } = useAuth();
  const { formatRelativeTime } = useRelativeTime();
  const router = useRouter();
  const { ToProfile } = useToProfile();

  const [showConfirm, setShowConfirm] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [savingPostId, setSavingPostId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { deletePost } = useDeletePosts();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getShineReactionType = (type?: string): ReactionType => {
    switch (type) {
      case "SAHNE":
        return "SHINE_SAHNE";
      case "MONOLOG":
        return "SHINE_MONOLOG";
      case "YANYANA":
        return "SHINE_YANYANA";
      case "TERSYUZ":
        return "SHINE_TERSYUZ";
      default:
        return "SHINE_SAHNE";
    }
  };

  const currentShineType = getShineReactionType(post?.postType);

  const {
    status: interactionStatus,
    toggleLike,
    toggleShine,
    toggleBookmark,
  } = usePostInteraction(!isOwner && user ? post.id : 0, currentShineType);

  const handleConfirmDelete = () => {
    deletePost(post?.id, () => {
      onDelete?.();
    });
    setShowConfirm(false);
    setIsMenuOpen(false);
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

  console.log("showReadButton ", showReadButton);
  console.log("isOwner", isOwner);
  console.log("post.viewCount ", post.viewCount);
  console.log("post", post);

  return (
    <div
      className={`w-full lg:h-[220px] sm:h-[220px] h-[180px] border-b border-gray-100 text-black flex select-none transition-all duration-300 ease-in-out gap-10 ${
        isOwner ? "overflow-visible" : "overflow-hidden"
      }`}
    >
      {/* SOL GÖRSEL */}
      <div className="h-full flex flex-col justify-center">
        <div
          className="hidden flex-shrink-0 sm:flex relative items-center justify-center"
          style={{ width: "160px", height: "160px" }}
        >
          <div className="relative w-full h-full bg-white overflow-hidden flex items-center justify-center border border-gray-100 rounded-xl">
            {finalImageUrl ? (
              <Image
                src={finalImageUrl}
                alt={post.title}
                fill
                unoptimized
                className="object-cover w-full h-full"
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
                  <span className="truncate hover:underline">
                    {authorName || "Yazar"}
                  </span>
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
          <div
            onClick={() => {
              if (isOwner) {
                const archivedFlag = post.isArchived ?? post.archived ?? false;
                router.push(
                  `/olustur?slug=${post?.slug}&isArchived=${archivedFlag}`,
                );
              } else {
                router.push(`/${post?.authorUsername}/${post?.slug}`);
              }
            }}
            className="flex flex-col gap-2 cursor-pointer"
          >
            <h2 className="text-base sm:text-[22px] line-clamp-2 font-semibold tracking-tight leading-snug">
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
                                ? "#f4d45f"
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
                                ? "#f4d45f"
                                : "#000000",
                    }}
                  />
                </span>
              </div>

              {/* GÖRÜNTÜLENME SAYISI: Taslak değilse (Yayınlanmış veya Arşivlenmişse) görünür */}
              {(!isOwner ||
                showReadButton ||
                (isOwner && (post.isArchived || post.archived))) && (
                <div className="relative pr-2 border-r border-gray-200 flex items-center gap-1">
                  <LuTheater className="text-xs text-gray-600" />
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-gray-600">
                      {post?.viewCount ?? 0}
                    </span>
                    <span className="text-gray-600">defa aralandı</span>
                  </div>
                </div>
              )}

              {/* KENDİ YAZISI VE TASLAK/ARŞİVSE: Taslağa Devam Et */}
              {isOwner && !showReadButton && (
                <div
                  className="relative flex items-center gap-1.5 cursor-pointer text-gray-600 hover:text-black transition"
                  onClick={() => {
                    const archivedFlag =
                      post.isArchived ?? post.archived ?? false;
                    router.push(
                      `/olustur?slug=${post.slug}&isArchived=${archivedFlag}`,
                    );
                  }}
                >
                  <LuPenLine className="text-xs" />
                  <span className="text-xs">Taslağa Devam Et</span>
                </div>
              )}

              {/* YAYINLANDIYSA VEYA BAŞKASININSA: Perdeyi Arala (Yazıya Git) */}
              {showReadButton && (
                <button
                  onClick={() =>
                    router.push(`/${post?.authorUsername}/${post?.slug}`)
                  }
                  className="text-gray-600 hover:text-gray-900 transition cursor-pointer"
                >
                  <span className="text-xs font-medium">Perdeyi Arala</span>
                </button>
              )}
            </div>

            {/* SAHİBİ İSE ÜÇ NOKTA DROPDOWN, DEĞİLSE ETKİLEŞİMLERİ GÖSTER */}
            {isOwner ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="py-1 px-2 text-gray-400 hover:text-black transition-colors cursor-pointer"
                >
                  <FiMoreHorizontal className="text-lg" />
                </button>

                {/* AÇILIR MENÜ */}
                {isMenuOpen && (
                  <div
                    className="absolute right-0 bottom-full w-48 flex flex-col bg-white rounded-sm z-50 px-4 py-3 gap-2"
                    style={{
                      boxShadow: "0px 0px 5px 1px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <button
                      onClick={() => {
                        router.push(`/olustur?slug=${post.slug}`);
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center text-xs text-gray-600 hover:text-black transition text-left cursor-pointer"
                    >
                      <span>Sahneyi Düzenle</span>
                    </button>

                    <div className="h-[1px] bg-gray-100" />

                    {/* ARŞİVE AL / ARŞİVDEN ÇIKAR SEÇENEĞİ */}
                    <button
                      onClick={() => {
                        onArchive?.();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center text-xs text-gray-600 hover:text-black transition text-left cursor-pointer"
                    >
                      <span>
                        {post.isArchived ? "Arşivden Çıkar" : "Arşive Al"}
                      </span>
                    </button>

                    <div className="h-[1px] bg-gray-100" />

                    <button
                      onClick={() => {
                        setShowConfirm(true);
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center text-xs transition text-left cursor-pointer"
                      style={{
                        color: "#b94445",
                      }}
                    >
                      <span>Sahneyi Sil</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <ul className="flex items-center gap-1.5">
                {/* BEĞEN */}
                <li
                  onClick={toggleLike}
                  className={`flex items-center gap-1 cursor-pointer transition-all duration-300`}
                >
                  {interactionStatus.isLiked ? (
                    <IoHeartSharp className="text-base text-red-500" />
                  ) : (
                    <IoHeartOutline className="text-base" />
                  )}
                </li>

                {/* SHINE (PARLAT) - Mod Bazlı */}
                <li
                  onClick={toggleShine}
                  className={`hidden sm:flex items-center gap-1 cursor-pointer transition-all duration-300`}
                >
                  {post.postType === "SAHNE" ? (
                    <>
                      {interactionStatus.isShined ? (
                        <PiHandsClappingFill
                          className={`text-base`}
                          style={{ color: "#c86b5a" }}
                        />
                      ) : (
                        <PiHandsClappingDuotone className={`text-base`} />
                      )}
                    </>
                  ) : post.postType === "MONOLOG" ? (
                    <>
                      {interactionStatus.isShined ? (
                        <PiFeatherFill
                          className="text-base"
                          style={{ color: "#66788a" }}
                        />
                      ) : (
                        <PiFeather className="text-base" />
                      )}
                    </>
                  ) : post.postType === "YANYANA" ? (
                    <>
                      {interactionStatus.isShined ? (
                        <MdCoffee
                          className="text-base"
                          style={{ color: "#789680" }}
                        />
                      ) : (
                        <MdOutlineCoffee className="text-base" />
                      )}
                    </>
                  ) : (
                    <>
                      {interactionStatus.isShined ? (
                        <RiUserSmileFill
                          className={`text-base`}
                          style={{ color: "#f4d45f" }}
                        />
                      ) : (
                        <RiUserSmileLine className={`text-base`} />
                      )}
                    </>
                  )}
                </li>

                {/* BOOKMARK (KAYDET) */}
                <li
                  onClick={() => {
                    if (interactionStatus.isBookmarked) {
                      // Zaten kayıtlıysa direkt genel toggle ile kayıttan çıkar
                      toggleBookmark();
                    } else {
                      // Kayıtlı değilse direkt koleksiyon seçim modalını aç
                      setSavingPostId(post.id);
                    }
                  }}
                  className={`hidden sm:flex items-center gap-1 cursor-pointer transition-all duration-300`}
                >
                  {interactionStatus.isBookmarked ? (
                    <TbBookmarkFilled className="text-base text-black" />
                  ) : (
                    <TbBookmark
                      onClick={() => setSavingPostId(post.id)}
                      className="text-base"
                    />
                  )}
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
          {savingPostId !== null && (
            <SaveToCollectionModal
              postId={savingPostId}
              isOpen={savingPostId !== null}
              onClose={() => setSavingPostId(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
