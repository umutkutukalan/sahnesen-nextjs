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
import { useAuth } from "@/context/UserContext";

interface FoyerPageProps {
  params: Promise<{ slug: string }>;
}

export default function FoyerPage({ params }: FoyerPageProps) {
  const { user } = useAuth();
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

  // Yanıtların sayfalanması ve açılıp kapanması için tutulan state'ler
  const [openRepliesCommentId, setOpenRepliesCommentId] = useState<
    number | null
  >(null);
  const [commentRepliesMap, setCommentRepliesMap] = useState<{
    [key: number]: CommentResponse[];
  }>({});
  const [replyPagesMap, setReplyPagesMap] = useState<{ [key: number]: number }>(
    {},
  );
  const [hasMoreRepliesMap, setHasMoreRepliesMap] = useState<{
    [key: number]: boolean;
  }>({});
  const [loadingRepliesId, setLoadingRepliesId] = useState<number | null>(null);

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

      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }
  };

  // Yanıt textarea'sı için otomatik yükseklik ayarlama fonksiyonu
  const handleReplyInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReplyContent(e.target.value);
    const target = e.target;
    target.style.height = "auto";
    target.style.height = `${target.scrollHeight}px`;
  };

  // Yanıtları Getir / Aç / Kapat Fonksiyonu (Sayfalamalı)
  const handleToggleReplies = async (commentId: number) => {
    if (openRepliesCommentId === commentId) {
      setOpenRepliesCommentId(null);
      return;
    }

    setOpenRepliesCommentId(commentId);

    if (!commentRepliesMap[commentId]) {
      try {
        setLoadingRepliesId(commentId);
        const fetchedReplies = await commentService.getReplies(commentId, 0, 5);

        setCommentRepliesMap((prev) => ({
          ...prev,
          [commentId]: fetchedReplies,
        }));
        setReplyPagesMap((prev) => ({ ...prev, [commentId]: 0 }));
        setHasMoreRepliesMap((prev) => ({
          ...prev,
          [commentId]: fetchedReplies.length === 5,
        }));
      } catch (err) {
        console.error("Yanıtlar yüklenirken hata:", err);
      } finally {
        setLoadingRepliesId(null);
      }
    }
  };

  // "Daha Fazla Yükle" Butonu Fonksiyonu
  const handleLoadMoreReplies = async (commentId: number) => {
    const nextPage = (replyPagesMap[commentId] || 0) + 1;
    try {
      setLoadingRepliesId(commentId);
      const moreReplies = await commentService.getReplies(
        commentId,
        nextPage,
        5,
      );

      setCommentRepliesMap((prev) => ({
        ...prev,
        [commentId]: [...(prev[commentId] || []), ...moreReplies],
      }));
      setReplyPagesMap((prev) => ({ ...prev, [commentId]: nextPage }));
      setHasMoreRepliesMap((prev) => ({
        ...prev,
        [commentId]: moreReplies.length === 5,
      }));
    } catch (err) {
      console.error("Daha fazla yanıt yüklenirken hata:", err);
    } finally {
      setLoadingRepliesId(null);
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

      setCommentRepliesMap((prev) => ({
        ...prev,
        [parentId]: [...(prev[parentId] || []), newReply],
      }));

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

      if (openRepliesCommentId !== parentId) {
        setOpenRepliesCommentId(parentId);
      }
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
        <div className="relative">
          <div className="absolute top-8 right-10  pointer-events-none z-10">
            <Image src={sahnemikrofonu} alt="" className="w-45"></Image>

            <div className="absolute top-5 right-10 w-7 h-7 rounded-full overflow-hidden">
              <img
                src={getFullImageUrl(post?.authorProfileImg)!}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </div>
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

        <div className="absolute top-25 left-35 -rotate-15 pointer-events-auto">
          {(() => {
            const uniqueAuthors = Array.from(
              new Map(
                comments.map((comment) => [comment.authorUsername, comment]),
              ).values(),
            );

            return (
              <ul className="flex items-center">
                {uniqueAuthors.slice(0, 8).map((comment, index) => (
                  <Link
                    key={comment.id || index}
                    href={`/profil/${comment.authorUsername}`}
                    className="w-7 h-7 rounded-full overflow-hidden -ml-2 first:ml-0 border-2 border-white shadow-sm transition-transform hover:scale-110 hover:z-20 relative"
                    style={{ zIndex: 8 - index }}
                  >
                    <img
                      src={getFullImageUrl(comment.authorProfileImg)!}
                      alt={comment.authorUsername}
                      className="object-cover w-full h-full"
                    />
                  </Link>
                ))}
                {uniqueAuthors.length > 8 && (
                  <div className="text-stone-700 text-[10px] font-bold flex items-center justify-center ml-1 z-0">
                    +{uniqueAuthors.length - 8}
                  </div>
                )}
              </ul>
            );
          })()}
        </div>
      </div>

      {/* Kaydırılabilir İçerik Alanı */}
      <div className="relative w-full h-full pt-45 pb-10 px-4 md:px-0 flex flex-col gap-4 z-10">
        {/* ÜST NAVİGASYON VE BAŞLIK */}
        <div className="flex flex-col gap-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <div
                className="flex items-center gap-2 cursor-pointer w-max"
                onClick={() => ToProfile(post?.authorUsername || "")}
              >
                <div className="relative w-7 h-7 rounded-full overflow-hidden border border-gray-200">
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
                <div
                  className={`w-fit flex items-center ${
                    isFoyerOpen ? "gap-2" : ""
                  } border border-gray-300 px-2 py-1 rounded-sm merriweather-sans`}
                >
                  <span className="text-[12px] text-gray-800">
                    {isFoyerOpen && "Fuaye Kapanış:"}
                  </span>
                  <span className="text-[12px] font-semibold">{timeLeft}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MEKTUP / YAZMA ALANI */}
        {isFoyerOpen ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="relative w-6 h-6 rounded-full overflow-hidden border border-gray-200">
                {user?.profileImg ? (
                  <Image
                    src={getFullImageUrl(user?.profileImg)!}
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
            <form
              onSubmit={handleSubmit}
              className="relative flex items-end border-b border-gray-200 w-full gap-2"
            >
              <textarea
                ref={textareaRef}
                rows={1}
                value={content}
                onChange={handleInput}
                placeholder="Sahneye bir not bırak"
                className="w-full pr-16 text-sm focus:outline-none resize-none overflow-hidden leading-relaxed placeholder:text-gray-400"
              />
              <button
                type="submit"
                disabled={content.trim().length === 0}
                className={`absolute right-0 top-1/2 -translate-y-1/2 text-xs text-gray-600 font-medium mr-4 ${content.trim().length === 0 ? "opacity-50" : "opacity-100 cursor-pointer"}`}
              >
                Paylaş
              </button>
            </form>
          </div>
        ) : (
          <div className="p-4 border border-neutral-200 rounded-xl text-xs text-neutral-800 flex items-center gap-2">
            <span className="font-semibold text-amber-800">
              Fuaye süresi dolmuştur.
            </span>{" "}
            Artık yeni ana mektup yazılamaz, ancak aşağıda bırakılmış mektupları
            inceleyip yanıtlar verebilirsiniz.
          </div>
        )}

        {/* MEKTUPLAR VE YANITLAR LİSTESİ */}
        <div className="flex flex-col gap-6">
          {comments.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-6 text-center">
              Henüz bu fuayeye bir mektup bırakılmamış. İlk mektubu sen yaz!
            </p>
          ) : (
            comments.map((comment) => {
              const isRepliesOpen = openRepliesCommentId === comment.id;
              const currentReplies = commentRepliesMap[comment.id] || [];
              const hasMore = hasMoreRepliesMap[comment.id];
              const isLoadingThis = loadingRepliesId === comment.id;

              return (
                <div
                  key={comment.id}
                  className="flex flex-col gap-3 pb-6 border-b border-gray-100 mt-2"
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
                        <span className="text-[10px] text-gray-500">
                          {formatRelativeTime(comment.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mektup İçeriği */}
                  <p className="text-xs text-gray-800 leading-relaxed font-normal">
                    {comment.content}
                  </p>

                  {/* Yanıtla ve Yanıtları Gör Butonu */}
                  <div className="flex items-center gap-4">
                    {comment.replies.length !== 0 ? (
                      <button
                        onClick={() => handleToggleReplies(comment.id)}
                        className="text-[10px] text-gray-500 hover:text-black font-medium flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <FiMessageSquare className="text-xs" />{" "}
                        {comment.replies.length} yanıt
                      </button>
                    ) : null}

                    <button
                      onClick={() =>
                        setReplyingToId(
                          replyingToId === comment.id ? null : comment.id,
                        )
                      }
                      className="text-[10px] underline font-medium cursor-pointer transition-colors"
                    >
                      Yanıt Yaz
                    </button>
                  </div>

                  {/* Alt Yanıtlar Listesi */}
                  {isRepliesOpen && (
                    <div className="ml-4 mt-3 flex flex-col gap-3 border-l-2 border-gray-100 pl-4">
                      {currentReplies.length === 0 && !isLoadingThis ? (
                        <p className="text-[11px] text-gray-400 italic">
                          Bu mektuba henüz yanıt yazılmamış.
                        </p>
                      ) : (
                        currentReplies.map((reply) => (
                          <div key={reply.id} className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 overflow-hidden">
                                  {reply.authorProfileImg ? (
                                    <img
                                      src={
                                        getFullImageUrl(reply.authorProfileImg)!
                                      }
                                      alt={reply.authorUsername}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    reply.authorName?.[0] || "U"
                                  )}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-medium text-gray-800">
                                    {reply.authorName} {reply.authorSurname}
                                  </span>
                                  <span className="text-[10px] text-gray-500">
                                    {formatRelativeTime(reply.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-gray-800 leading-relaxed font-normal">
                              {reply.content}
                            </p>
                          </div>
                        ))
                      )}

                      {/* Daha Fazla Yükle Butonu */}
                      {hasMore && (
                        <button
                          onClick={() => handleLoadMoreReplies(comment.id)}
                          disabled={isLoadingThis}
                          className="w-fit text-[11px] font-medium text-gray-500 hover:text-black mt-2 cursor-pointer transition-colors"
                        >
                          {isLoadingThis
                            ? "Yükleniyor..."
                            : "Daha fazla yükle..."}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Yanıt Yazma Kutusu (Otomatik Genişleyen Alan) */}
                  {replyingToId === comment.id && (
                    <div className="ml-4 flex flex-col border-l px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg gap-2">
                      <textarea
                        rows={1}
                        value={replyContent}
                        onChange={handleReplyInput}
                        placeholder={`${comment.authorName} ${comment.authorSurname} adlı kullanıcıya yanıt ver...`}
                        className="w-full p-2 text-xs focus:outline-none focus:border-black resize-none overflow-hidden leading-relaxed bg-transparent"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setReplyingToId(null)}
                          className="text-xs text-gray-500 hover:text-black cursor-pointer"
                        >
                          İptal
                        </button>
                        <button
                          onClick={() => handleAddReply(comment.id)}
                          className="px-3 py-1.5 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-800 cursor-pointer"
                        >
                          Gönder
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
