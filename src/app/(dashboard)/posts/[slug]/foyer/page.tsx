"use client";

import { useEffect, useState, use, useRef } from "react";
import {
  commentService,
  CommentResponse,
} from "@/services/client/comment/comment.service";
import { useRelativeTime } from "@/hooks/useRelativeTime";
import { FiSend, FiMessageSquare, FiUser, FiArrowLeft } from "react-icons/fi";
import Link from "next/link";
import { PostResponse } from "@/services/server/post.service";
import { getPostBySlugClient } from "@/services/client/post.service";
import { getFullImageUrl } from "@/utils/image";
import Image from "next/image";
import {
  hali,
  sahnekoltuklari,
  sahnekoltuklaridevami,
  sahnemikrofonu,
} from "@/utils";
import { TbRosetteDiscountCheckFilled } from "react-icons/tb";
import { useToProfile } from "@/utils/useToProfile";

interface FoyerPageProps {
  params: Promise<{ slug: string }>;
}

export default function FoyerPage({ params }: FoyerPageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [post, setPost] = useState<PostResponse | null>(null);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCommentContent, setNewCommentContent] = useState("");
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isFoyerOpen, setIsFoyerOpen] = useState(true);

  const [content, setContent] = useState("");
  const maxLength = 400; // Maksimum karakter sınırı
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { formatRelativeTime } = useRelativeTime();
  const { ToProfile } = useToProfile();

  // Yazıyı ve yorumları çekme
  useEffect(() => {
    const fetchData = async () => {
      try {
        const postData = await getPostBySlugClient(slug);
        setPost(postData);

        if (postData?.id) {
          const commentsRes = await commentService.getComments(postData.id);
          setComments(commentsRes);
        }

        if (postData?.discussionEndsAt) {
          const rawDateStr = postData.discussionEndsAt;
          const endsAtString = rawDateStr.endsWith("Z")
            ? rawDateStr
            : rawDateStr + "Z";

          const endsAt = new Date(endsAtString).getTime();
          const now = new Date().getTime();
          if (now > endsAt) {
            setIsFoyerOpen(false);
          }
        }
      } catch (err) {
        console.error("Fuaye verileri yüklenirken hata:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  // Sayaç Mantığı
  useEffect(() => {
    if (!post?.discussionEndsAt) return;

    let timer: NodeJS.Timeout;

    const updateCountdown = () => {
      const rawDateStr = post.discussionEndsAt!;
      const endsAtString = rawDateStr.endsWith("Z")
        ? rawDateStr
        : rawDateStr + "Z";

      const endsAt = new Date(endsAtString).getTime();
      const now = new Date().getTime();
      const distance = endsAt - now;

      if (distance < 0) {
        setIsFoyerOpen(false);
        setTimeLeft("Fuaye Kapandı");
        if (timer) clearInterval(timer);
      } else {
        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft(
          `${String(hours).padStart(2, "0")}s ${String(minutes).padStart(2, "0")}d ${String(seconds).padStart(2, "0")}s`,
        );
      }
    };

    updateCountdown();
    timer = setInterval(updateCountdown, 1000);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [post?.discussionEndsAt]);

  // Ana Mektup Gönderme
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentContent.trim() || !post) return;

    try {
      const newComment = await commentService.addComment(post.id, {
        content: newCommentContent,
        parentId: null,
      });
      setComments((prev) => [...prev, newComment]);
      setNewCommentContent("");
    } catch (err: any) {
      alert(err.response?.data?.message || "Mektup gönderilemedi.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !post) return;

    try {
      const newComment = await commentService.addComment(post.id, {
        content: content,
        parentId: null,
      });
      setComments((prev) => [...prev, newComment]);
      setContent("");

      // Gönderildikten sonra textarea yüksekliğini ilk haline sıfırla
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Mektup gönderilemedi.");
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setContent(value);

      // Yüksekliği içeriğe göre otomatik ayarla
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }
  };

  // Alt Yanıt (Reply) Gönderme
  const handleAddReply = async (parentId: number) => {
    if (!replyContent.trim() || !post) return;

    try {
      const newReply = await commentService.addComment(post.id, {
        content: replyContent,
        parentId: parentId,
      });

      setComments((prev) =>
        prev.map((c) => {
          if (c.id === parentId) {
            return {
              ...c,
              replies: [...c.replies, newReply],
            };
          }
          return c;
        }),
      );

      setReplyContent("");
      setReplyingToId(null);
    } catch (err: any) {
      alert(err.response?.data?.message || "Yanıt gönderilemedi.");
    }
  };

  const authorName =
    `${post?.authorName || ""} ${post?.authorSurname || ""}`.trim();

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-64px)] w-full flex items-center justify-center bg-private text-black">
        <p className="text-sm text-gray-500">Fuaye kapıları aralanıyor...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full mx-auto px-6 lg:px-0 lg:w-[800px] mix-h-screen bg-private text-black flex flex-col justify-center">
      <div className="relative">
        <div className="absolute top-8 right-10  pointer-events-none z-10">
          <Image src={sahnemikrofonu} alt="" className="w-45"></Image>
        </div>

        <div className="absolute -top-1 right-0 pointer-events-none">
          <Image src={hali} alt="" className="w-80"></Image>
        </div>

        <div className="absolute top-0 -left-0 rotate-[-15deg] pointer-events-none">
          <Image src={sahnekoltuklari} alt="" className="w-100"></Image>
        </div>

        <div className="absolute -top-1 -left-8 rotate-[-15deg] pointer-events-none">
          <Image src={sahnekoltuklaridevami} alt="" className="w-100"></Image>
        </div>

        <div className="absolute -top-4 -left-8 rotate-[-15deg] pointer-events-none">
          <Image src={sahnekoltuklaridevami} alt="" className="w-100"></Image>
        </div>

        <div className="absolute -top-8 -left-8 rotate-[-15deg] pointer-events-none">
          <Image src={sahnekoltuklaridevami} alt="" className="w-100"></Image>
        </div>

        <div className="absolute top-0 left-1/2 bg-red-500">
          <ul className="flex items-center gap-2">
            {comments.map((comment, index) => (
              <Link
                key={index}
                href={`/profil/${comment.authorUsername}`}
                className="w-6 h-6 rounded-full overflow-hidden"
              >
                <img
                  src={getFullImageUrl(comment.authorProfileImg)!}
                  alt={comment.authorUsername}
                  className="object-cover w-full h-full"
                />
              </Link>
            ))}
          </ul>
        </div>
      </div>
      {/* Kaydırılabilir İçerik Alanı */}
      <div className="relative w-full h-full overflow-y-auto pt-40 pb-10 px-4 md:px-0 flex flex-col gap-8 z-10 custom-scrollbar">
        {/* ÜST NAVİGASYON VE BAŞLIK */}
        <div className="flex flex-col gap-4 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <div
                className="flex items-center gap-2 cursor-pointer w-max"
                onClick={() => ToProfile(post?.authorUsername || "")}
              >
                <div className="relative w-5 h-5 rounded-full overflow-hidden border border-gray-200">
                  {post?.authorProfileImg ? (
                    <Image
                      src={getFullImageUrl(post?.authorProfileImg)!}
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
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <h1
                  className="text-[32px] md:text-[42px] merriweather-sans font-semibold z-10"
                  style={{ lineHeight: "48px", letterSpacing: "-0.03em" }}
                >
                  {post?.title}
                </h1>
                {post?.subtitle && (
                  <p className="text-[18px] md:text-[22px] text-gray-500 font-normal leading-snug tracking-tight">
                    {post?.subtitle}
                  </p>
                )}
                {/* SAYAÇ ROZETİ */}
                <div className="w-fit flex items-center gap-2 border border-gray-900 bg-gray-200 px-2 py-1 rounded-sm merriweather-sans">
                  <span className="text-[12px] font-semibold text-gray-800">
                    {isFoyerOpen ? "Fuaye Kapanış:" : "Fuaye Kapandı"}
                  </span>
                  <span className="text-[12px] font-semibold">{timeLeft}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MEKTUP / YAZMA ALANI */}
        {isFoyerOpen ? (
          <form
            onSubmit={handleSubmit}
            className="relative flex items-end w-full gap-2"
          >
            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                rows={1}
                value={content}
                onChange={handleInput}
                placeholder="Yorum ekle..."
                className="w-full py-2.5 pl-4 pr-16 border-b border-gray-200 text-sm focus:outline-none resize-none overflow-hidden leading-relaxed placeholder:text-gray-400"
              />
            </div>

            <button
              type="submit"
              disabled={content.trim().length === 0}
              className={`absolute right-0 top-1/2 -translate-y-1/2 text-xs text-gray-600 font-medium mr-4 ${content.trim().length === 0 ? "opacity-50" : "opacity-100 cursor-pointer"}`}
            >
              Paylaş
            </button>
          </form>
        ) : (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
            <span>⚠️</span>
            Fuaye süresi dolmuştur. Artık yeni ana mektup yazılamaz, ancak
            aşağıda bırakılmış mektupları inceleyip yanıtlar verebilirsiniz.
          </div>
        )}

        {/* MEKTUPLAR VE YANITLAR LİSTESİ */}
        <div className="flex flex-col gap-6 mt-4">
          <h2 className="text-sm font-bold tracking-wider uppercase text-gray-400">
            Mektuplar ({comments.length})
          </h2>

          {comments.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-6 text-center">
              Henüz bu fuayeye bir mektup bırakılmamış. İlk mektubu sen yaz!
            </p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="flex flex-col gap-3 p-5 rounded-2xl bg-white border border-gray-200 shadow-sm"
              >
                {/* Yazar Bilgisi */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 overflow-hidden">
                      {comment.authorProfileImg ? (
                        <img
                          src={getFullImageUrl(comment.authorProfileImg)!}
                          alt={comment.authorUsername}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        comment.authorName?.[0] || "U"
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-gray-800">
                        {comment.authorName} {comment.authorSurname}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        @{comment.authorUsername}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {formatRelativeTime(comment.createdAt)}
                  </span>
                </div>

                {/* Mektup İçeriği */}
                <p className="text-sm text-gray-800 leading-relaxed font-normal pl-9">
                  {comment.content}
                </p>

                {/* Yanıtla Butonu */}
                <div className="pl-9 flex items-center gap-4">
                  <button
                    onClick={() =>
                      setReplyingToId(
                        replyingToId === comment.id ? null : comment.id,
                      )
                    }
                    className="text-xs text-gray-500 hover:text-black font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <FiMessageSquare /> Yanıtla ({comment.replies.length})
                  </button>
                </div>

                {/* Alt Yanıtlar Listesi */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-9 mt-3 flex flex-col gap-3 border-l-2 border-gray-100 pl-4">
                    {comment.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className="flex flex-col gap-1.5 py-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-800">
                            {reply.authorName} {reply.authorSurname}{" "}
                            <span className="text-[10px] text-gray-400 font-normal">
                              @{reply.authorUsername}
                            </span>
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {formatRelativeTime(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-700">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Yanıt Yazma Kutusu */}
                {replyingToId === comment.id && (
                  <div className="ml-9 mt-2 flex flex-col gap-2 pt-3 border-t border-gray-100">
                    <textarea
                      rows={2}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder={`${comment.authorUsername} adlı kullanıcıya yanıt ver...`}
                      className="w-full p-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setReplyingToId(null)}
                        className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer"
                      >
                        İptal
                      </button>
                      <button
                        onClick={() => handleAddReply(comment.id)}
                        className="px-3 py-1.5 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-800 cursor-pointer"
                      >
                        Yanıtı Gönder
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
