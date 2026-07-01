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

// Syntax Highlighting için Gerekli Yapılar
import { createLowlight, common } from "lowlight";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import css from "highlight.js/lib/languages/css";
import python from "highlight.js/lib/languages/python";
import csharp from "highlight.js/lib/languages/csharp";
import cpp from "highlight.js/lib/languages/cpp";
import sql from "highlight.js/lib/languages/sql";

const lowlight = createLowlight(common);
lowlight.register("java", java);
lowlight.register("javascript", javascript);
lowlight.register("js", javascript);
lowlight.register("ts", javascript);
lowlight.register("css", css);
lowlight.register("python", python);
lowlight.register("csharp", csharp);
lowlight.register("cpp", cpp);
lowlight.register("sql", sql);

const SAMPLE_COMMENT_CREATED_AT = new Date(
  Date.now() - 2 * 60 * 60 * 1000,
).toISOString();

interface DetailProps {
  post: PostResponse;
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
      comment:
        "Çok güzel anlatmışsın! Bu konuyu araştırıyordum tam zamanında geldi 🚀",
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

  // Lowlight AST (Abstract Syntax Tree) yapısını React elementlerine dönüştüren zırhlı render fonksiyonu
  const renderLowlightNodes = (
    nodes: any[],
    keyPrefix = "hl",
  ): React.ReactNode[] => {
    return nodes.map((node, i) => {
      const key = `${keyPrefix}-${i}`;
      if (node.type === "text") {
        return node.value;
      }
      if (node.type === "element") {
        const className = node.properties?.className?.join(" ") || "";
        return (
          <span key={key} className={className}>
            {renderLowlightNodes(node.children, key)}
          </span>
        );
      }
      return null;
    });
  };

  const extractSubtitle = (contentStr: string): string | null => {
    try {
      const parsed = JSON.parse(contentStr);
      const nodes = parsed?.content;
      if (!nodes || !Array.isArray(nodes)) return null;

      const h1Index = nodes.findIndex(
        (n: any) => n.type === "heading" && n.attrs?.level === 1,
      );

      if (h1Index === -1) return null;

      const next = nodes[h1Index + 1];
      if (next?.type === "heading" && next.attrs?.level === 2) {
        return next.content?.map((t: any) => t.text || "").join("") || null;
      }

      return null;
    } catch {
      return null;
    }
  };

  const subtitle = extractSubtitle(post.content);

  // GELİŞMİŞ TIPTAP JSON STRING RENDER MOTORU
  const renderTiptapContent = (contentStr: string) => {
    try {
      if (!contentStr) return null;
      const parsed = JSON.parse(contentStr);

      if (!parsed || !parsed.content || !Array.isArray(parsed.content))
        return null;

      let firstMeaningfulIndex = -1;

      for (let i = 0; i < parsed.content.length; i++) {
        const node = parsed.content[i];

        // Eğer gelen eleman paragraf değilse direkt anlamlı içeriktir, index'i kilitle ve çık
        if (node.type !== "paragraph") {
          firstMeaningfulIndex = i;
          break;
        }

        // 1. Durum: node.content hiç yoksa veya boş array ise
        const isAbsolutelyEmpty =
          !node.content ||
          !Array.isArray(node.content) ||
          node.content.length === 0;

        // 2. Durum: Paragrafın içindeki tüm metin parçalarını toplayıp temizliyoruz
        let totalTextContent = "";
        if (node.content && Array.isArray(node.content)) {
          node.content.forEach((child: any) => {
            if (child.type === "text" && child.text) {
              totalTextContent += child.text;
            }
          });
        }

        // Eğer içeride hiç 'text' düğümü yoksa veya olan tüm metinler tamamen boşluk karakteriyse ("   " gibi)
        const isTextContentEmpty = totalTextContent.trim() === "";

        // 💡 EĞER PARAGRAF YAPISAL OLARAK BOŞSA VEYA İÇİNDEKİ METİNLERİN TAMAMI BOŞLUKSA
        if (isAbsolutelyEmpty || isTextContentEmpty) {
          continue; // Boş satırdır, es geç!
        }

        // Yukarıdaki filtrelere takılmadıysa içinde gerçek, görünür bir metin veya görsel öğe vardır!
        firstMeaningfulIndex = i;
        break;
      }

      // Eğer dökümanın tamamı boş satırlardan oluşuyorsa hiçbir şey render etme
      if (firstMeaningfulIndex === -1) return null;

      // Döküman içeriğini sadece ilk anlamlı verinin başladığı yerden itibaren kesiyoruz
      const cleanedContent = parsed.content.slice(firstMeaningfulIndex);

      const renderTextNodes = (textNodes: any[]) => {
        if (!textNodes || !Array.isArray(textNodes)) return "";

        return textNodes.map((node: any, idx: number) => {
          if (node.type === "hardBreak") {
            return <br key={idx} />;
          }

          // Dropcap node'unu büyük baş harf olarak render et
          if (node.type === "dropcap") {
            return (
              <span key={idx} className="dropcap-letter" aria-hidden="true">
                {node.attrs?.letter || ""}
              </span>
            );
          }

          let element: React.ReactNode = node.text || "";

          if (node.marks && Array.isArray(node.marks)) {
            node.marks.forEach((mark: any) => {
              if (mark.type === "bold") {
                element = (
                  <strong key={idx} className="font-bold text-gray-950">
                    {element}
                  </strong>
                );
              }
              if (mark.type === "italic") {
                element = (
                  <em key={idx} className="italic text-gray-800">
                    {element}
                  </em>
                );
              }
              if (mark.type === "underline") {
                element = (
                  <u key={idx} className="underline text-gray-900">
                    {element}
                  </u>
                );
              }
              if (mark.type === "code") {
                element = (
                  <code key={idx} className="detail-inline-code">
                    {element}
                  </code>
                );
              }
              if (mark.type === "link" && mark.attrs?.href) {
                element = (
                  <a
                    key={idx}
                    href={mark.attrs.href}
                    target={mark.attrs.target || "_blank"}
                    rel={mark.attrs.rel || "noopener noreferrer"}
                    className="hover:text-gray-600 underline transition-colors cursor-pointer"
                  >
                    {element}
                  </a>
                );
              }
            });
          }
          return <span key={idx}>{element}</span>;
        });
      };

      return cleanedContent.map((node: any, index: number) => {
        switch (node.type) {
          case "paragraph":
            // İçeriği tamamen boş olan paragrafları render etme
            if (!node.content || node.content.length === 0) return null;

            const textContent = node.content
              .filter((c: any) => c.type === "text")
              .map((c: any) => c.text || "")
              .join("");

            const hasOnlyDropcap =
              node.content.length === 1 && node.content[0].type === "dropcap";

            if (textContent.trim() === "" && !hasOnlyDropcap) return null;

            if (node.content && Array.isArray(node.content)) {
              const hasInlineImage = node.content.find(
                (c: any) => c.type === "image",
              );

              if (hasInlineImage && hasInlineImage.attrs?.src) {
                const imgUrl = hasInlineImage.attrs.src.startsWith("http")
                  ? hasInlineImage.attrs.src
                  : `http://localhost:8080${hasInlineImage.attrs.src}`;

                return (
                  <div className="flex flex-col gap-2 w-full" key={index}>
                    <div className="w-full h-auto relative overflow-hidden">
                      <Image
                        src={imgUrl}
                        alt={hasInlineImage.attrs.alt || "Sahnesen görseli"}
                        width={0}
                        height={0}
                        sizes="(max-width: 768px) 100vw, 75vw"
                        priority
                        unoptimized
                        className="w-full h-auto object-contain rounded-lg"
                      />
                    </div>
                  </div>
                );
              }
            }

            const isDropcap = node.attrs?.dropcap === true;

            return (
              <p
                key={index}
                className={`text-gray-800 text-[18px] md:text-[20px] leading-relaxed mb-5 md:mb-10 font-normal ${isDropcap ? "dropcap" : ""}`}
                style={{
                  letterSpacing: "-0.003em",
                  lineHeight: "1.58",
                  marginTop: "0.94em",
                }}
              >
                {node.content ? renderTextNodes(node.content) : <br />}
              </p>
            );

          case "heading":
            const headingLevel = node.attrs?.level || 2;

            // İlk H1'i zaten atlıyorduk, şimdi hemen ardından gelen H2'yi de atla
            if (headingLevel === 2) {
              try {
                const parsedContent =
                  typeof contentStr === "string"
                    ? JSON.parse(contentStr)
                    : contentStr;

                const h1Index = parsedContent?.content?.findIndex(
                  (n: any) => n.type === "heading" && n.attrs?.level === 1,
                );

                // Bu node, h1'den hemen sonraki h2 mi?
                const absoluteIndex = firstMeaningfulIndex + index;
                if (h1Index !== -1 && absoluteIndex === h1Index + 1) {
                  return null;
                }
              } catch {}
            }

            if (headingLevel === 1) {
              try {
                // 1. Elindeki string'i güvenle objeye çeviriyoruz
                const parsedContent =
                  typeof contentStr === "string"
                    ? JSON.parse(contentStr)
                    : contentStr;

                // 2. Obje içindeki düğümlerden ilk H1'in index'ini buluyoruz
                const firstH1Index = parsedContent?.content?.findIndex(
                  (n: any) => n.type === "heading" && n.attrs?.level === 1,
                );

                // 3. Eğer şu an dönen element ilk H1 ise ekrana basma, es geç
                if (index === firstH1Index) {
                  return null;
                }
              } catch (err) {
                console.error("JSON parse hatası:", err);
              }
            }

            const HeadingTag =
              `h${headingLevel}` as keyof JSX.IntrinsicElements;
            const headingClasses: Record<number, string> = {
              1: "text-4xl font-extrabold tracking-tight text-gray-950 mt-10 mb-4",
              2: "text-[24px] md:text-[28px] font-extrabold tracking-tight leading-[30px] font-sans",
              3: "text-[20px] md:text-[22px] font-extrabold tracking-tight -mb-[0.56em] leading-[30px] font-sans",
            };
            return (
              <HeadingTag
                key={index}
                className={
                  headingClasses[node.attrs?.level || 2] || headingClasses[2]
                }
              >
                {node.content
                  ? node.content.map((t: any) => t.text || "").join("")
                  : ""}
              </HeadingTag>
            );

          case "image":
            if (node.attrs?.src) {
              const imageUrl = node.attrs.src.startsWith("http")
                ? node.attrs.src
                : `http://localhost:8080${node.attrs.src}`;

              const width = node.attrs.width || "100%";
              // Eğer genişlik '100%' ise tam ekran (isFull) modundadır
              const isFull = width === "100%";
              const isMedium = width === "75%";
              const isSmall = width === "50%";

              const rawAlt = node.attrs.alt || "";
              const cleanAlt = rawAlt
                .replace(/#(small|medium|full)/gi, "")
                .trim();

              return (
                <div
                  key={index}
                  className={`my-8 flex flex-col items-center ${
                    isFull
                      ? "w-screen relative left-1/2 -translate-x-1/2"
                      : isMedium
                        ? "relative left-1/2 -translate-x-1/2 w-[120%]" // 👈 içerikten taşar
                        : "w-full" // small: içerik genişliğinde
                  }`}
                >
                  <div
                    style={isFull || isMedium ? {} : { width: "100%" }}
                    className={`not-prose overflow-hidden transition-all duration-300 w-full h-auto`}
                  >
                    <Image
                      src={imageUrl}
                      alt={cleanAlt || "Sahnesen görseli"}
                      width={0}
                      height={0}
                      sizes={isFull ? "100vw" : isMedium ? "120vw" : "100vw"}
                      priority={index < 2}
                      unoptimized
                      className={`w-full block ${
                        isFull ? "h-full object-cover" : "h-auto object-contain"
                      }`}
                    />
                  </div>

                  {cleanAlt && (
                    <span className="text-xs text-center italic text-gray-400 px-4 mt-3 font-sans block w-full">
                      {cleanAlt}
                    </span>
                  )}
                </div>
              );
            }
            return null;

          case "bulletList":
            return (
              <ul
                key={index}
                className="list-disc pl-8 my-4 space-y-2 marker:text-black"
              >
                {node.content?.map((item: any, i: number) => (
                  <li
                    key={i}
                    className="text-gray-800 text-[18px] md:text-[20px] leading-relaxed"
                  >
                    {item.content?.map((child: any, j: number) =>
                      child.type === "paragraph" ? (
                        <span key={j}>
                          {child.content ? renderTextNodes(child.content) : ""}
                        </span>
                      ) : null,
                    )}
                  </li>
                ))}
              </ul>
            );

          case "orderedList":
            return (
              <ol
                key={index}
                className="list-decimal pl-8 my-4 space-y-2 marker:text-black"
              >
                {node.content?.map((item: any, i: number) => (
                  <li
                    key={i}
                    className="text-gray-800 text-[18px] md:text-[20px] leading-relaxed"
                  >
                    {item.content?.map((child: any, j: number) =>
                      child.type === "paragraph" ? (
                        <span key={j}>
                          {child.content ? renderTextNodes(child.content) : ""}
                        </span>
                      ) : null,
                    )}
                  </li>
                ))}
              </ol>
            );

          case "blockquote":
            return (
              <blockquote
                key={index}
                className="border-l-4 border-black pl-5 my-8"
              >
                {node.content?.map((child: any, i: number) => {
                  if (child.type === "paragraph") {
                    return (
                      <p
                        key={i}
                        className="italic text-zinc-800 antialiased text-[18px] md:text-[20px] leading-relaxed"
                      >
                        {child.content ? renderTextNodes(child.content) : ""}
                      </p>
                    );
                  }
                  return null;
                })}
              </blockquote>
            );

          // 5. Apple Tarzı Renklendirilmiş Kod Bloğu (Code Block)
          case "codeBlock":
            const codeLang = node.attrs?.language || "auto";
            const rawContent = node.content
              ? node.content.map((t: any) => t.text || "").join("")
              : "";

            let highlightedAst = null;

            try {
              // Sadece içi gerçekten kod benzeri bir şeyse ve dil kayıtlıysa highlight et
              if (
                codeLang &&
                codeLang !== "auto" &&
                lowlight.registered(codeLang)
              ) {
                highlightedAst = lowlight.highlight(codeLang, rawContent);
              } else if (rawContent.trim().length > 0) {
                // Düz metin çıktısı değilse auto-highlight dene
                highlightedAst = lowlight.highlightAuto(rawContent);
              }
            } catch (err) {
              console.error("Highlighting hatası:", err);
            }

            // Güvenlik Kilidi: Eğer lowlight içi boş bir AST ürettiyse veya başarısız olduysa
            // ya da gelen içerik düz bir çıktıysa (3\n3\n3 gibi), ham içeriğe geri dön
            const hasValidAst =
              highlightedAst &&
              highlightedAst.children &&
              highlightedAst.children.length > 0;

            return (
              <div key={index} className="w-full my-6">
                {/* Kod Alanı - whitespace-pre-wrap ve break-words eklendi */}
                <pre className="apple-code-theme p-6 text-sm md:text-[14px] font-mono overflow-x-auto leading-relaxed text-black bg-[#f5f5f7] rounded-lg whitespace-pre-wrap break-words">
                  <code>
                    {hasValidAst && highlightedAst
                      ? renderLowlightNodes(highlightedAst.children)
                      : rawContent}
                  </code>
                </pre>
              </div>
            );

          case "horizontalRule":
            return (
              <div
                key={index}
                className="w-full flex items-center justify-center my-10 select-none"
                aria-hidden="true"
              >
                <span className="text-zinc-400 text-2xl tracking-[0.6em] font-medium pl-[0.6em]">
                  ···
                </span>
              </div>
            );

          default:
            return null;
        }
      });
    } catch (e) {
      console.error("Tiptap parse hatası (Detail):", e);
      return (
        <p className="text-red-500 text-sm">
          İçerik render edilirken bir mimari hata oluştu.
        </p>
      );
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  const authorFullName =
    `${post.authorName || ""} ${post.authorSurname || ""}`.trim();

  return (
    <div className="page pt-25 bg-private text-black min-h-screen">
      {/* Apple Renklendirme CSS injection alanı */}
      <style jsx global>{`
        .apple-code-theme .hljs-keyword {
          color: #9b2385;
          font-weight: 600;
        }
        .apple-code-theme .hljs-title,
        .apple-code-theme .hljs-title.class_,
        .apple-code-theme .hljs-title.function_ {
          color: #1c00cf;
        }
        .apple-code-theme .hljs-string {
          color: #c41a16;
        }
        .apple-code-theme .hljs-comment {
          color: #007400;
          font-style: italic;
        }
        .apple-code-theme .hljs-number {
          color: #1c00cf;
        }
        .apple-code-theme .hljs-meta {
          color: #643820;
          font-weight: 500;
        }
        .apple-code-theme .hljs-params {
          color: #5c6166;
        }
        .apple-code-theme .hljs-attr {
          color: #836c28;
        }
        .apple-code-theme .hljs-built_in {
          color: #5c3b92;
        }
      `}</style>

      <div
        className={`page-padding flex gap-5 relative ${!isCommentsOpen && "items-center justify-center"}`}
      >
        <div className="flex flex-col w-full lg:w-[850px] gap-10 transition-all duration-300 relative px-2 md:px-15">
          {/* YAZAR ÜST BARI */}
          <div className="flex flex-col w-full">
            <div className="w-full flex items-center justify-between border-b pb-5 border-gray-200">
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200 cursor-pointer flex items-end justify-center">
                    {post.authorProfileImg ? (
                      <Image
                        src={post.authorProfileImg}
                        alt={authorFullName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <FiUser className="text-2xl text-gray-500" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-700 cursor-pointer font-medium">
                        {authorFullName || "Yazar"}
                      </span>
                      <TbRosetteDiscountCheckFilled
                        className="text-blue-500"
                        title="Onaylı Yazar"
                      />
                    </div>
                    <span className="text-[10px] text-gray-400">
                      @{post.authorUsername}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* BAŞLIK VE METADATA */}
            <div className="flex flex-col gap-3 border-b py-4 border-gray-200">
              <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">
                {post.postType}
              </span>
              <h1
                className="text-[32px] md:text-[42px] font-extrabold tracking-tight text-gray-900 font-sans"
                style={{ lineHeight: "48px", letterSpacing: "-0.011em" }}
              >
                {post.title}
              </h1>
              {subtitle && (
                <p className="text-[18px] md:text-[22px] text-gray-500 font-normal leading-snug tracking-tight">
                  {subtitle}
                </p>
              )}
              <div className="flex items-center gap-2 text-xs text-gray-500 select-none">
                <p>5 min read</p>
                <span>•</span>
                <p>{formatRelativeTime(post.createdAt)}</p>
                {post.viewCount !== undefined && post.viewCount !== null && (
                  <>
                    <span>•</span>
                    <p className="text-blue-600 font-medium">
                      {post.viewCount} görüntülenme
                    </p>
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
          <div className="prose max-w-none antialiased playfair-display-400">
            {renderTiptapContent(post.content)}
          </div>
        </div>

        {/* YORUMLAR TOGGLE BUTONU */}
        <button
          onClick={toggleComments}
          className={`fixed bottom-6 right-6 flex items-center gap-2 rounded-full border shadow-md px-4 py-2.5 transition-all cursor-pointer ${
            isCommentsOpen
              ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
              : "text-gray-600 border-gray-200 hover:text-gray-800 hover:bg-gray-50 bg-white"
          }`}
        >
          <BiCommentDetail className="text-base" />
          <span className="text-xs font-semibold">
            {sampleComments.length} Yorum
          </span>
        </button>
      </div>
    </div>
  );
};

export default Detail;
