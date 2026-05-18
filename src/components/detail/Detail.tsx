"use client";

import { useRelativeTime } from "@/hooks/useRelativeTime";
import { PostResponse } from "@/services/server/post.service";
import { useEffect, useState } from "react";
import { BiCommentDetail } from "react-icons/bi";
import LoadingScreen from "../LoadingScreen";
import { FiUser } from "react-icons/fi";
import { TbRosetteDiscountCheckFilled } from "react-icons/tb";
import { IoIosMore, IoMdHeart } from "react-icons/io";
import { usePostLike } from "@/hooks/like/usePostLike";
import { useUnlikedPost } from "@/hooks/like/useUnlikedPost";
import { useGetLikeCount } from "@/hooks/likes/useGetLikeCount";
import { useHasUserLiked } from "@/hooks/likes/useHasUserLiked";
import Image from "next/image";

const SAMPLE_COMMENT_CREATED_AT = new Date(
  Date.now() - 2 * 60 * 60 * 1000,
).toISOString();

interface DetailProps {
  post: PostResponse; // Artık projenin veya blogun ayrımı yok, sadece tek bir zırhlı post var!
}

const Detail = ({ post }: DetailProps) => {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const { formatRelativeTime } = useRelativeTime();
  const { likedPost } = usePostLike();
  const { hasUserLiked, liked, isLoading } = useHasUserLiked();
  const [likedLocal, setLikedLocal] = useState<null | boolean>(liked);
  const { unlikedPost } = useUnlikedPost();
  const { likeCount, getLikeCount } = useGetLikeCount();
  const [likeCountLocal, setLikeCountLocal] = useState(likeCount);

  // Like hook'una göndereceğimiz tip parametresini backend'den gelen postType ile senkronize ediyoruz
  const type = post.postType.toLowerCase();

  const toggleComments = () => {
    setIsCommentsOpen(!isCommentsOpen);
  };

  const sampleComments = [
    {
      id: 1,
      username: "ahmet_dev",
      avatar: "A",
      avatarColor: "from-blue-500 to-purple-500",
      comment: "Çok güzel anlatmışsın! Bu konuyu araştırıyordum tam zamanında geldi 🚀",
      createdAt: SAMPLE_COMMENT_CREATED_AT,
    },
  ];

  useEffect(() => {
    setLikedLocal(liked);
  }, [liked]);

  useEffect(() => {
    setLikeCountLocal(likeCount);
  }, [likeCount]);

  useEffect(() => {
    hasUserLiked(post.id, type);
    getLikeCount(post.id, type);
  }, [post.id, type, hasUserLiked, getLikeCount]);

  const checkedLikeBtn = () => {
    if (likedLocal) {
      setLikedLocal(false);
      setLikeCountLocal((prev) => prev - 1);
      unlikedPost(post.id, type);
    } else {
      setLikedLocal(true);
      setLikeCountLocal((prev) => prev + 1);
      likedPost(post.id, type);
    }
  };

  // 🔥 GELİŞMİŞ TIPTAP JSON STRING RENDER MOTORU
  const renderTiptapContent = (contentStr: string) => {
    try {
      if (!contentStr) return null;
      const parsed = JSON.parse(contentStr);

      if (!parsed || !parsed.content || !Array.isArray(parsed.content)) return null;

      // Inline text stillerini (Bold, Italic, Code) işleyen yardımcı fonksiyon
      const renderTextNodes = (textNodes: any[]) => {
        if (!textNodes || !Array.isArray(textNodes)) return "";

        return textNodes.map((node: any, idx: number) => {
          let element: React.ReactNode = node.text || "";

          if (node.marks && Array.isArray(node.marks)) {
            node.marks.forEach((mark: any) => {
              if (mark.type === "bold") {
                element = <strong key={idx} className="font-bold text-gray-900">{element}</strong>;
              }
              if (mark.type === "italic") {
                element = <em key={idx} className="italic text-gray-800">{element}</em>;
              }
              if (mark.type === "code") {
                element = (
                  <code key={idx} className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded font-mono text-sm border border-gray-200">
                    {element}
                  </code>
                );
              }
            });
          }
          return <span key={idx}>{element}</span>;
        });
      };

      // Ana Tiptap Bloklarını Render Ediyoruz
      return parsed.content.map((node: any, index: number) => {
        switch (node.type) {
          // 1. Paragraf
          // 1. Paragraf (İçinde inline imaj barındırma ihtimaline karşı zırhlı)
          case "paragraph":
            if (node.content && Array.isArray(node.content)) {
              // Eğer paragrafın içinde tipi "image" olan bir çocuk node varsa
              const hasInlineImage = node.content.find((c: any) => c.type === "image");

              if (hasInlineImage && hasInlineImage.attrs?.src) {
                const imgUrl = hasInlineImage.attrs.src.startsWith('http')
                  ? hasInlineImage.attrs.src
                  : `http://localhost:8080${hasInlineImage.attrs.src}`;

                return (
                  <div className="my-8 flex flex-col gap-2 w-full" key={index}>
                    <div className="w-full rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgUrl}
                        alt={hasInlineImage.attrs.alt || "Sahnesen görseli"}
                        className="w-full h-auto max-h-[600px] object-cover"
                      />
                    </div>
                  </div>
                );
              }
            }

            // Normal paragraf metni basımı
            return (
              <p key={index} className="text-gray-800 text-lg leading-relaxed mb-6 font-normal">
                {node.content ? renderTextNodes(node.content) : <br />}
              </p>
            );

          // 2. Başlıklar (Heading)
          case "heading":
            const HeadingTag = `h${node.attrs?.level || 2}` as keyof JSX.IntrinsicElements;
            const headingClasses: Record<number, string> = {
              1: "text-4xl font-extrabold tracking-tight text-gray-950 mt-10 mb-4",
              2: "text-2xl font-bold tracking-tight text-gray-900 mt-8 mb-4 border-b pb-2 border-gray-100",
              3: "text-xl font-semibold tracking-tight text-gray-900 mt-6 mb-3",
            };
            return (
              <HeadingTag key={index} className={headingClasses[node.attrs?.level || 2] || headingClasses[2]}>
                {node.content ? node.content.map((t: any) => t.text || "").join("") : ""}
              </HeadingTag>
            );

          // 3. Görsel Düğümü
          case "image":
            if (node.attrs?.src) {
              // Eğer URL "http" ile başlamıyorsa, başına backend url'ini yapıştırıyoruz
              const imageUrl = node.attrs.src.startsWith('http')
                ? node.attrs.src
                : `http://localhost:8080${node.attrs.src}`;

              return (
                <div className="my-8 flex flex-col gap-2 w-full" key={index}>
                  <div className="w-full rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt={node.attrs.alt || "Sahnesen görseli"}
                      className="w-full h-auto max-h-[600px] object-cover"
                    />
                  </div>
                  {node.attrs.alt && (
                    <span className="text-xs text-center italic text-gray-400 px-4">
                      {node.attrs.alt}
                    </span>
                  )}
                </div>
              );
            }
            return null;

          // 4. Alıntı (Blockquote)
          case "blockquote":
            return (
              <blockquote key={index} className="border-l-4 border-blue-600 pl-4 italic text-gray-600 my-6 text-xl bg-gray-50 py-2 pr-2 rounded-r-lg">
                {node.content ? renderTextNodes(node.content) : ""}
              </blockquote>
            );

          // 5. Kod Bloğu (Code Block)
          case "codeBlock":
            const codeLang = node.attrs?.language || "auto";
            return (
              <div key={index} className="relative my-6 rounded-xl overflow-hidden bg-zinc-950 text-zinc-100 font-mono text-sm shadow-xl border border-zinc-800">
                <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-[10px] text-zinc-400 select-none tracking-wider uppercase">
                  <span>{codeLang}</span>
                  <span className="lowercase text-zinc-500">sahnesen compiler</span>
                </div>
                <pre className="p-4 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                  <code>
                    {node.content ? node.content.map((t: any) => t.text || "").join("") : ""}
                  </code>
                </pre>
              </div>
            );

          // 6. Yatay Ayraç (Horizontal Rule / Üç Nokta Üç Çizgi)
          case "horizontalRule":
            return (
              <hr key={index} className="my-10 border-t border-gray-200 w-full" />
            );

          default:
            return null;
        }
      });
    } catch (e) {
      console.error("Tiptap parse hatası (Detail):", e);
      return <p className="text-red-500 text-sm">İçerik render edilirken bir mimari hata oluştu.</p>;
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  const authorFullName = `${post.authorName || ""} ${post.authorSurname || ""}`.trim();

  return (
    <div className="page pt-25 bg-white text-black min-h-screen">
      <div className={`page-padding flex gap-5 relative ${!isCommentsOpen && "items-center justify-center"}`}>

        {/* ANA İÇERİK BLOĞU */}
        <div className="flex flex-col w-240 gap-10 transition-all duration-300 relative">

          {/* YAZAR ÜST BARI */}
          <div className="flex flex-col">
            <div className="w-full flex items-center justify-between border-b pb-5 border-gray-200">
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200 cursor-pointer flex items-end justify-center">
                    {post.authorProfileImg ? (
                      <Image src={post.authorProfileImg} alt={authorFullName} fill className="object-cover" />
                    ) : (
                      <FiUser className="text-2xl text-gray-500" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-700 cursor-pointer font-medium">
                        {authorFullName || "Yazar"}
                      </span>
                      <TbRosetteDiscountCheckFilled className="text-blue-500" title="Onaylı Yazar" />
                    </div>
                    <span className="text-[10px] text-gray-400">@{post.authorUsername}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* BAŞLIK VE METADATA */}
            <div className="flex flex-col gap-3 border-b py-4 border-gray-200">
              <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">{post.postType}</span>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">{post.title}</h1>
              <div className="flex items-center gap-2 text-xs text-gray-500 select-none">
                <p>5 min read</p>
                <span>•</span>
                <p>{formatRelativeTime(post.createdAt)}</p>
                {post.viewCount !== undefined && post.viewCount !== null && (
                  <>
                    <span>•</span>
                    <p className="text-blue-600 font-medium">{post.viewCount} görüntülenme</p>
                  </>
                )}
              </div>
            </div>

            {/* BEĞENİ VE ETKİLEŞİM BARI */}
            <div className="h-full w-full flex items-center py-2 justify-between border-b border-gray-200">
              <div className="h-full flex items-center gap-0.5 text-gray-500">
                <IoMdHeart
                  className={`text-2xl cursor-pointer hover:scale-110 transition-transform ${likedLocal ? "text-red-500" : ""}`}
                  onClick={() => checkedLikeBtn()}
                />
                <span className="text-sm">
                  {likeCountLocal >= 1000
                    ? (likeCountLocal % 1000 === 0
                      ? (likeCountLocal / 1000).toFixed(0)
                      : Math.floor(likeCountLocal / 100) / 10) + "K"
                    : likeCountLocal}
                </span>
              </div>
              <div className="flex items-center gap-3 h-full">
                <div className="flex items-center gap-1 h-full text-xs">
                  <div className="px-3 py-1 rounded-md border border-gray-300 flex items-center justify-center gap-1 cursor-pointer hover:bg-gray-50">
                    <span>#{post.postType.toLowerCase()}</span>
                  </div>
                </div>
                <IoIosMore className="text-2xl cursor-pointer text-gray-400 hover:text-gray-700" />
              </div>
            </div>
          </div>

          {/* REAL TIPTAP İÇERİK ALANI */}
          <div className="prose max-w-none antialiased">
            {renderTiptapContent(post.content)}
          </div>

        </div>

        {/* YORUMLAR TOGGLE BUTONU */}
        <button
          onClick={toggleComments}
          className={`fixed bottom-6 right-6 flex items-center gap-2 rounded-full border shadow-md px-4 py-2.5 transition-all cursor-pointer ${isCommentsOpen
            ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            : "text-gray-600 border-gray-200 hover:text-gray-800 hover:bg-gray-50 bg-white"
            }`}
        >
          <BiCommentDetail className="text-base" />
          <span className="text-xs font-semibold">{sampleComments.length} Yorum</span>
        </button>

      </div>
    </div>
  );
};

export default Detail;