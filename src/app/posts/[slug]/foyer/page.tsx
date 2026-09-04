"use client";

import { useEffect, useState, use } from "react";
import {
  commentService,
  CommentResponse,
} from "@/services/client/comment/comment.service";
import { useRelativeTime } from "@/hooks/useRelativeTime";
import { FiArrowLeft, FiSend, FiMessageSquare } from "react-icons/fi";
import { MdCoffee } from "react-icons/md";
import Link from "next/link";
import { PostResponse } from "@/services/server/post.service";
import { getPostBySlugClient } from "@/services/client/post.service";
import { getFullImageUrl } from "@/utils/image";

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

  const { formatRelativeTime } = useRelativeTime();

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

        // Süre kontrolü (UTC garantili parse için sonuna 'Z' ekliyoruz)
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

  // Sayaç Mantığı (Her saniye kalan süreyi hesaplar)
  useEffect(() => {
    if (!post?.discussionEndsAt) return;

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
        clearInterval(timer);
      } else {
        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Şık bir görünüm için 2 haneli formatlayabilirsin (Opsiyonel ama şık durur)
        setTimeLeft(
          `${String(hours).padStart(2, "0")}s ${String(minutes).padStart(2, "0")}d ${String(seconds).padStart(2, "0")}s`,
        );
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
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

  // Alt Yanıt (Reply) Gönderme
  const handleAddReply = async (parentId: number) => {
    if (!replyContent.trim() || !post) return;

    try {
      const newReply = await commentService.addComment(post.id, {
        content: replyContent,
        parentId: parentId,
      });

      // State içindeki ilgili ana mektubun replies dizisine ekle
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-private text-black">
        <p className="text-sm text-gray-500">Fuaye kapıları aralanıyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-private text-black py-10 px-4 md:px-0 flex justify-center">
      <div className="w-full lg:w-[800px] flex flex-col gap-8">
        {/* ÜST NAVİGASYON VE BAŞLIK */}
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-6">
          <Link
            href={`/posts/${slug}`}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-black transition-colors w-fit cursor-pointer"
          >
            <FiArrowLeft /> Yazıya Geri Dön
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                <MdCoffee />
              </div>
              <div>
                <h1 className="text-xl font-bold font-sans">
                  Sahne Arkası Fuaye
                </h1>
                <p className="text-xs text-gray-500 truncate max-w-[400px]">
                  {post?.title}
                </p>
              </div>
            </div>

            {/* SAYAÇ ROZETİ */}
            <div className="px-4 py-2 bg-gray-100 rounded-xl flex flex-col items-end">
              <span className="text-[10px] uppercase font-semibold text-gray-400">
                {isFoyerOpen ? "Kapanışa Kalan" : "Fuaye Kapandı"}
              </span>
              <span className="text-xs font-bold text-gray-800 font-mono">
                {timeLeft}
              </span>
            </div>
          </div>
        </div>

        {/* MEKTUP / YAZMA ALANI */}
        {isFoyerOpen ? (
          <form
            onSubmit={handleAddComment}
            className="flex flex-col gap-3 bg-gray-50 p-5 rounded-2xl border border-gray-200"
          >
            <label className="text-xs font-semibold text-gray-700">
              Fuayeye Mektubunu Bırak (Bu anın tanığı ol)
            </label>
            <textarea
              rows={3}
              value={newCommentContent}
              onChange={(e) => setNewCommentContent(e.target.value)}
              placeholder="Düşüncelerini, hissettiklerini veya ilk izlenimlerini paylaş..."
              className="w-full p-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors resize-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-black text-white text-xs font-medium rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <FiSend /> Mektubu Gönder
              </button>
            </div>
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
