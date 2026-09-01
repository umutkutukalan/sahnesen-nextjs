"use client";

import { useRelativeTime } from "@/hooks/useRelativeTime";
import { PostResponse } from "@/services/server/post.service";
import { JSX, useEffect } from "react";
import LoadingScreen from "../LoadingScreen";
import { FiUser } from "react-icons/fi";
import {
  TbBookmark,
  TbBookmarkFilled,
  TbRosetteDiscountCheckFilled,
} from "react-icons/tb";
import { IoIosMore } from "react-icons/io";
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
import { usePostInteraction } from "@/hooks/interaction/usePostInteraction";
import { RiCandleFill, RiUserSmileFill, RiUserSmileLine } from "react-icons/ri";
import { MdCoffee, MdOutlineCoffee } from "react-icons/md";
import {
  PiFeather,
  PiFeatherFill,
  PiHandsClappingDuotone,
  PiHandsClappingFill,
} from "react-icons/pi";
import { ReactionType } from "@/services/client/interaction/interaction.service";
import { IoHeartOutline, IoHeartSharp } from "react-icons/io5";

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

interface DetailProps {
  post: PostResponse;
}

// Tiptap JSON Düğüm Yapıları İçin Türler
interface TiptapMark {
  type: string;
  attrs?: {
    href?: string;
    target?: string;
    rel?: string;
    letter?: string;
    [key: string]: unknown;
  };
}

interface TiptapNode {
  type: string;
  attrs?: {
    level?: number;
    src?: string;
    alt?: string;
    width?: string;
    height?: string;
    aspectRatio?: string | number | null;
    letter?: string;
    language?: string;
    [key: string]: unknown;
  };
  content?: TiptapNode[];
  text?: string;
  marks?: TiptapMark[];
}

interface TiptapDocument {
  type?: string;
  content?: TiptapNode[];
}

// Lowlight AST (Abstract Syntax Tree) Düğüm Yapısı İçin Türler
interface LowlightNode {
  type: string;
  value?: string;
  properties?: {
    className?: string[];
  };
  children?: LowlightNode[];
}

const Detail = ({ post }: DetailProps) => {
  const { formatRelativeTime } = useRelativeTime();

  // Post tipine göre dinamik ReactionType belirleme
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

  // YENİ POST ETKİLEŞİM HOOK'UMUZ
  const {
    status,
    isLoading: isInteractionLoading,
    toggleLike,
    toggleShine,
    toggleBookmark,
  } = usePostInteraction(post.id, currentShineType);

  // Sayı Formatlayıcı Helper (Örn: 1200 -> 1.2K)
  const formatCount = (count: number) => {
    if (count >= 1000) {
      return (
        (count % 1000 === 0
          ? (count / 1000).toFixed(0)
          : Math.floor(count / 100) / 10) + "K"
      );
    }
    return count;
  };

  // Post tipine göre aktif/pasif ikonları ve marka renklerini tanımlıyoruz
  const SHINE_CONFIG = {
    SAHNE: {
      activeIcon: PiHandsClappingFill,
      inactiveIcon: PiHandsClappingDuotone,
      color: "#c86b5a",
    },
    MONOLOG: {
      activeIcon: PiFeatherFill,
      inactiveIcon: PiFeather,
      color: "#66788a",
    },
    YANYANA: {
      activeIcon: MdCoffee,
      inactiveIcon: MdOutlineCoffee,
      color: "#789680",
    },
    TERSYUZ: {
      activeIcon: RiUserSmileFill,
      inactiveIcon: RiUserSmileLine,
      color: "#eab308", // #fdfd96 çok açık sarı olduğu için arayüzde görünmeyebilir, burayı istediğin bir tona ayarlayabilirsin
    },
  };

  const postType = post.postType as keyof typeof SHINE_CONFIG;
  const config = SHINE_CONFIG[postType] || SHINE_CONFIG.SAHNE; // Fallback

  // Aktif veya pasif duruma göre ilgili ikon componentini seçiyoruz
  const IconComponent = status.isShined
    ? config.activeIcon
    : config.inactiveIcon;

  useEffect(() => {
    // 1. Standart window scroll'unu en üste çek
    window.scrollTo(0, 0);

    // 2. Eğer CSS'teki layout/page container'ı kendi içinde scroll aldıysa onu da sıfırla
    const pageContainer = document.querySelector(".page");
    if (pageContainer) {
      pageContainer.scrollTop = 0;
    }
  }, []);

  // Lowlight AST (Abstract Syntax Tree) yapısını React elementlerine dönüştüren zırhlı render fonksiyonu
  const renderLowlightNodes = (
    nodes: LowlightNode[],
    keyPrefix = "hl",
  ): React.ReactNode[] => {
    return nodes.map((node: LowlightNode, i: number) => {
      const key = `${keyPrefix}-${i}`;
      if (node.type === "text") {
        return node.value;
      }
      if (node.type === "element") {
        const className = node.properties?.className?.join(" ") || "";
        return (
          <span key={key} className={className}>
            {renderLowlightNodes(node.children || [], key)}
          </span>
        );
      }
      return null;
    });
  };

  const extractSubtitle = (contentStr: string): string | null => {
    try {
      const parsed: TiptapDocument = JSON.parse(contentStr);
      const nodes = parsed?.content;
      if (!nodes || !Array.isArray(nodes)) return null;

      const h1Index = nodes.findIndex(
        (n: TiptapNode) => n.type === "heading" && n.attrs?.level === 1,
      );

      if (h1Index === -1) return null;

      const next = nodes[h1Index + 1];
      if (next?.type === "heading" && next.attrs?.level === 2) {
        return (
          next.content?.map((t: TiptapNode) => t.text || "").join("") || null
        );
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

        if (node.type !== "paragraph") {
          firstMeaningfulIndex = i;
          break;
        }

        const isAbsolutelyEmpty =
          !node.content ||
          !Array.isArray(node.content) ||
          node.content.length === 0;

        let totalTextContent = "";
        if (node.content && Array.isArray(node.content)) {
          node.content.forEach((child: TiptapNode) => {
            if (child.type === "text" && child.text) {
              totalTextContent += child.text;
            }
          });
        }

        const isTextContentEmpty = totalTextContent.trim() === "";

        if (isAbsolutelyEmpty || isTextContentEmpty) {
          continue;
        }

        firstMeaningfulIndex = i;
        break;
      }

      if (firstMeaningfulIndex === -1) return null;

      const cleanedContent = parsed.content.slice(firstMeaningfulIndex);

      const renderTextNodes = (textNodes: TiptapNode[]) => {
        if (!textNodes || !Array.isArray(textNodes)) return "";

        return textNodes.map((node: TiptapNode, idx: number) => {
          if (node.type === "hardBreak") {
            return <br key={idx} />;
          }

          if (node.type === "dropcap") {
            return (
              <span key={idx} className="dropcap-letter" aria-hidden="true">
                {node.attrs?.letter || ""}
              </span>
            );
          }

          let element: React.ReactNode = node.text || "";

          if (node.marks && Array.isArray(node.marks)) {
            node.marks.forEach((mark: TiptapMark) => {
              if (mark.type === "bold") {
                element = (
                  <strong key={idx} className="font-bold">
                    {element}
                  </strong>
                );
              }
              if (mark.type === "italic") {
                element = (
                  <em key={idx} className="italic">
                    {element}
                  </em>
                );
              }
              if (mark.type === "underline") {
                element = (
                  <u key={idx} className="underline">
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

      return cleanedContent.map((node: TiptapNode, index: number) => {
        const prevNode = index > 0 ? cleanedContent[index - 1] : null;
        const prevIsH2 =
          prevNode?.type === "heading" && prevNode.attrs?.level === 2;
        const prevIsH3 =
          prevNode?.type === "heading" && prevNode.attrs?.level === 3;

        switch (node.type) {
          case "paragraph":
            if (!node.content || node.content.length === 0) return null;

            const textContent = node.content
              .filter((c: TiptapNode) => c.type === "text")
              .map((c: TiptapNode) => c.text || "")
              .join("");

            const hasOnlyDropcap =
              node.content.length === 1 && node.content[0].type === "dropcap";

            if (textContent.trim() === "" && !hasOnlyDropcap) return null;

            if (node.content && Array.isArray(node.content)) {
              const hasInlineImage = node.content.find(
                (c: TiptapNode) => c.type === "image",
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
                className={`text-gray-800 text-[18px] md:text-[20px] leading-relaxed font-normal ${isDropcap ? "dropcap" : ""}`}
                style={{
                  letterSpacing: "-0.003em",
                  lineHeight: "1.58",
                  marginTop: prevIsH2 ? "12px" : prevIsH3 ? "6px" : "28px",
                  marginBottom: "0px",
                }}
              >
                {node.content ? renderTextNodes(node.content) : <br />}
              </p>
            );

          case "heading":
            const headingLevel = node.attrs?.level || 2;

            if (headingLevel === 2) {
              try {
                const parsedContent =
                  typeof contentStr === "string"
                    ? JSON.parse(contentStr)
                    : contentStr;

                const h1Index = parsedContent?.content?.findIndex(
                  (n: TiptapNode) =>
                    n.type === "heading" && n.attrs?.level === 1,
                );

                const absoluteIndex = firstMeaningfulIndex + index;
                if (h1Index !== -1 && absoluteIndex === h1Index + 1) {
                  return null;
                }
              } catch {}
            }

            if (headingLevel === 1) {
              try {
                const parsedContent =
                  typeof contentStr === "string"
                    ? JSON.parse(contentStr)
                    : contentStr;

                const firstH1Index = parsedContent?.content?.findIndex(
                  (n: TiptapNode) =>
                    n.type === "heading" && n.attrs?.level === 1,
                );

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
              2: "text-[24px] md:text-[28px] font-extrabold tracking-tight leading-[30px] font-sans mb-0 mt-[53px]",
              3: "text-[20px] md:text-[22px] font-extrabold tracking-tight leading-[30px] font-sans mb-0 mt-[30px]",
            };
            return (
              <HeadingTag
                key={index}
                className={
                  headingClasses[node.attrs?.level || 2] || headingClasses[2]
                }
              >
                {node.content
                  ? node.content.map((t: TiptapNode) => t.text || "").join("")
                  : ""}
              </HeadingTag>
            );

          case "image":
            if (node.attrs?.src) {
              const imageUrl = node.attrs.src.startsWith("http")
                ? node.attrs.src
                : `http://localhost:8080${node.attrs.src}`;

              const width = node.attrs.width || "100%";
              const isFull = width === "100%";
              const isMedium = width === "75%";

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
                        ? "relative left-1/2 -translate-x-1/2 w-[120%]"
                        : "w-full"
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
                {node.content?.map((item: TiptapNode, i: number) => (
                  <li
                    key={i}
                    className="text-gray-800 text-[18px] md:text-[20px] leading-relaxed"
                  >
                    {item.content?.map((child: TiptapNode, j: number) =>
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
                {node.content?.map((item: TiptapNode, i: number) => (
                  <li
                    key={i}
                    className="text-gray-800 text-[18px] md:text-[20px] leading-relaxed"
                  >
                    {item.content?.map((child: TiptapNode, j: number) =>
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
              <blockquote key={index} className="blockquote">
                {node.content?.map((child: TiptapNode, i: number) => {
                  if (child.type === "paragraph") {
                    return (
                      <p key={i}>
                        {child.content ? renderTextNodes(child.content) : ""}
                      </p>
                    );
                  }
                  return null;
                })}
              </blockquote>
            );

          case "codeBlock":
            const codeLang = node.attrs?.language || "auto";
            const rawContent = node.content
              ? node.content.map((t: TiptapNode) => t.text || "").join("")
              : "";

            let highlightedAst = null;

            try {
              if (
                codeLang &&
                codeLang !== "auto" &&
                lowlight.registered(codeLang)
              ) {
                highlightedAst = lowlight.highlight(codeLang, rawContent);
              } else if (rawContent.trim().length > 0) {
                highlightedAst = lowlight.highlightAuto(rawContent);
              }
            } catch (err) {
              console.error("Highlighting hatası:", err);
            }

            const hasValidAst =
              highlightedAst &&
              highlightedAst.children &&
              highlightedAst.children.length > 0;

            return (
              <div key={index} className="w-full my-6">
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

  const authorFullName =
    `${post.authorName || ""} ${post.authorSurname || ""}`.trim();

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  const authorProfileImgUrl = post.authorProfileImg
    ? post.authorProfileImg.startsWith("http")
      ? post.authorProfileImg
      : `${baseUrl}/${post.authorProfileImg}`
    : null;

  return (
    <div className="page pt-5 bg-private text-black min-h-screen">
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

      <div className={`page-padding flex justify-center gap-5 relative`}>
        <div className="flex flex-col w-full lg:w-[850px] gap-10 transition-all duration-300 relative px-2 md:px-15">
          {/* YAZAR ÜST BARI */}
          <div className="flex flex-col w-full">
            <div className="w-full flex items-center justify-between border-b pb-5 border-gray-200">
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200 cursor-pointer flex items-end justify-center">
                    {authorProfileImgUrl ? (
                      <Image
                        src={authorProfileImgUrl}
                        alt={authorFullName}
                        fill
                        priority // <-- Yazar görseli yukarıda olduğu için eklendi
                        unoptimized
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

            {/* GÜNCELLENMİŞ BEĞENİ, PARLATMA VE KAYDETME BARI */}
            <div className="h-full w-full flex items-center py-2.5 justify-between border-b border-gray-200 select-none">
              <div className="flex items-center gap-3">
                {/* Beğeni Butonu */}
                <button
                  onClick={toggleLike}
                  disabled={isInteractionLoading}
                  className="flex items-center gap-1.5 text-gray-600 hover:text-red-500 transition-colors group cursor-pointer"
                  title="Beğen"
                >
                  {status.isLiked ? (
                    <IoHeartSharp className="text-2xl text-red-500" />
                  ) : (
                    <IoHeartOutline className="text-2xl" />
                  )}

                  <span
                    className={`text-xs font-medium ${status.isLiked ? "text-red-500 font-semibold" : ""}`}
                  >
                    {formatCount(status.likeCount)}
                  </span>
                </button>

                {/* Parlatma (Shine) Butonu */}
                <button
                  onClick={toggleShine}
                  disabled={isInteractionLoading}
                  className="flex items-center gap-1.5 text-gray-600 hover:opacity-80 transition-all group cursor-pointer"
                  title="Parlat"
                >
                  <IconComponent
                    className="text-2xl transition-transform active:scale-110"
                    style={{
                      color: status.isShined ? config.color : undefined,
                    }}
                  />

                  <span
                    className={`text-xs font-medium transition-colors ${
                      status.isShined ? "font-semibold" : "text-gray-500"
                    }`}
                    style={{
                      color: status.isShined ? config.color : undefined,
                    }}
                  >
                    {formatCount(status.shineCount)}
                  </span>
                </button>
              </div>

              {/* Sağ Etkileşim Grubu */}
              <div className="flex items-center gap-4">
                {/* Kaydetme (Bookmark) Butonu */}
                <button
                  onClick={() => toggleBookmark()}
                  disabled={isInteractionLoading}
                  className="transition-colors cursor-pointer"
                  title={status.isBookmarked ? "Kaydedildi" : "Kaydet"}
                >
                  {status.isBookmarked ? (
                    <TbBookmarkFilled className="text-xl text-black scale-110 transition-transform" />
                  ) : (
                    <TbBookmark className="text-xl hover:scale-110 transition-transform" />
                  )}
                </button>

                {/* Post Tipi Etiketi */}
                <div className="px-3 py-1 rounded-md border border-gray-200 flex items-center justify-center text-xs text-gray-500">
                  #{post.postType.toLowerCase()}
                </div>

                {/* Diğer Seçenekler */}
                <button className="text-2xl text-gray-400 hover:text-gray-700 transition-colors cursor-pointer">
                  <IoIosMore />
                </button>
              </div>
            </div>
          </div>

          {/* REAL TIPTAP İÇERİK ALANI */}
          <div className="prose max-w-none antialiased playfair-display-400">
            {renderTiptapContent(post.content)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detail;
