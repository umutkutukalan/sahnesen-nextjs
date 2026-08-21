"use client";

import { FiUser } from "react-icons/fi";
import { LuImages } from "react-icons/lu";
import { TbRosetteDiscountCheckFilled } from "react-icons/tb";
import { PiHandsClappingLight } from "react-icons/pi";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { useRelativeTime } from "../../hooks/useRelativeTime";
import { useGetLikeCount } from "@/hooks/likes/useGetLikeCount";
import { useHasUserLiked } from "@/hooks/likes/useHasUserLiked";
import { useToProfile } from "@/utils/useToProfile";
import { PostResponse } from "@/services/server/post.service";
import { FaTicketSimple } from "react-icons/fa6";
import { IoMdHeart } from "react-icons/io";
import { CiHeart } from "react-icons/ci";
import { BiBookmarks } from "react-icons/bi";
import { useAuth } from "@/context/UserContext";
import { useDeletePosts } from "@/hooks/projects/useDeleteProject";

interface PostCardProps {
  post: PostResponse; // Tip adını yeni post mimarisine çektik
  showActions?: boolean;
  onDelete?: () => void;
}

const PostCard = ({ post, showActions = false, onDelete }: PostCardProps) => {
  const { user } = useAuth();
  const { formatRelativeTime } = useRelativeTime();
  const router = useRouter();
  const { ToProfile } = useToProfile();
  const { hasUserLiked, liked } = useHasUserLiked();
  const { likeCount, getLikeCount } = useGetLikeCount();

  const [showConfirm, setShowConfirm] = useState(false);
  const { deletePost } = useDeletePosts();

  const handleConfirmDelete = () => {
    if (user?.username !== post?.authorUsername) return;
    deletePost(post?.id, () => {
      onDelete?.();
    });
    setShowConfirm(false);
  };

  useEffect(() => {
    hasUserLiked(post?.id, "post");
    getLikeCount(post?.id, "post");
  }, [post?.id]);

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
  const displayImage = post?.coverImage || getFirstImageSrc(post?.content);
  const finalImageUrl = displayImage
    ? displayImage.startsWith("http")
      ? displayImage
      : `http://localhost:8080${displayImage}`
    : null;

  // Yeni backend mimarimizde yazarı doğrudan düzleştirilmiş (flat) olarak alıyoruz
  const authorName =
    `${post?.authorName || ""} ${post?.authorSurname || ""}`.trim();

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  // Gelen string'in başında "/" yoksa, url birleştirirken çift slash olmaması için kontrol ediyoruz
  const authorProfileImgUrl = post?.authorProfileImg
    ? post?.authorProfileImg.startsWith("http")
      ? post?.authorProfileImg
      : `${baseUrl}/${post?.authorProfileImg}`
    : null;

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
              alt={post.title}
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

      {/* LEFT IMAGE */}
      <div className="h-full flex flex-col justify-center">
        <div className="w-45 h-35 hidden flex-shrink-0 sm:flex items-center justify-center">
          {" "}
          <div
            className={`relative w-full h-full bg-white overflow-hidden flex items-center justify-center ${
              finalImageUrl ? "" : ""
            }`}
          >
            {finalImageUrl ? (
              <Image
                src={finalImageUrl}
                alt={post.title}
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

      {/* RIGHT CONTENT */}
      <div className="lg:w-4/5 w-3/4 w-full h-full flex flex-col justify-center">
        {/* TITLE + CONTENT */}
        <div className="mt-2 flex flex-col gap-4">
          {/* AUTHOR */}
          <div
            className="flex items-center gap-2 cursor-pointer w-max"
            onClick={() => ToProfile(null, post.authorUsername)} // Doğrudan authorUsername'e yönlendiriyoruz
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
                {/* <span className="truncate text-[10px] text-gray-400">
                  @{project.authorUsername}
                </span> */}
              </div>
              <span className="text-[8px]">•</span>
              <span className="text-[10px] text-gray-500">
                {formatRelativeTime(post?.createdAt)}
              </span>
            </div>
          </div>

          {/* Title & Content */}
          <div className="flex flex-col gap-2">
            <h2 className="text-base sm:text-xl font-semibold line-clamp-2">
              {post?.title}
            </h2>

            {/* Tiptap string'ini buraya besliyoruz */}
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
              {post?.subtitle || "İçerik önizlemesi bulunamadı..."}
            </p>
          </div>

          {/* FOOTER */}
          <div className="mt-3 w-full flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="relative pr-4 border-r border-gray-200">
                <span className="relative z-5">
                  <FaTicketSimple
                    className={`${
                      post?.postType === "SAHNE"
                        ? "text-black"
                        : post?.postType === "MONOLOG"
                          ? "text-[#f3c102]"
                          : post?.postType === "YANYANA"
                            ? "text-[#fa9ec1]"
                            : post?.postType === "TERSYUZ"
                              ? "text-[#94c5fd]"
                              : "text-black"
                    }`}
                  />
                </span>
                <span className="absolute left-2 -top-0.5 rotate-15 z-10">
                  {/* "text-[#faf8f6]" */}
                  <FaTicketSimple
                    className={`${
                      post?.postType === "SAHNE"
                        ? "text-black"
                        : post?.postType === "MONOLOG"
                          ? "text-[#f3c102]"
                          : post?.postType === "YANYANA"
                            ? "text-[#fa9ec1]"
                            : post?.postType === "TERSYUZ"
                              ? "text-[#94c5fd]"
                              : "text-black"
                    }`}
                  />
                </span>
              </div>
              <button
                onClick={() =>
                  router.push(`/${post?.authorUsername}/${post?.slug}`)
                } // Yeni şık rota mantığımız
                className="text-gray-600 hover:text-gray-900 transition cursor-pointer"
              >
                <div className="flex items-start gap-1">
                  {/* <LuTheater className="text-sm text-[#d80104]" /> */}
                  <span className="text-[10px]">Perdeyi Arala</span>
                </div>
              </button>
            </div>
            <ul className="flex items-center gap-2">
              <li className="hidden sm:flex items-center gap-1">
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
              </li>
              <li className="hidden sm:flex items-center gap-1">
                <PiHandsClappingLight />
                <span>
                  {likeCount >= 1000
                    ? `${Math.floor(likeCount / 100) / 10}K`
                    : likeCount}
                </span>
              </li>
              <li className="hidden sm:flex items-center gap-1">
                <BiBookmarks />
                <span>
                  {likeCount >= 1000
                    ? `${Math.floor(likeCount / 100) / 10}K`
                    : likeCount}
                </span>
              </li>
            </ul>
          </div>
          {showConfirm && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-xs z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col gap-4">
                <span>Bu gönderiyi silmek istediğinize emin misiniz?</span>
                <div className="flex gap-3 justify-end">
                  <button
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
                    onClick={() => setShowConfirm(false)}
                  >
                    Vazgeç
                  </button>
                  <button
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
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
