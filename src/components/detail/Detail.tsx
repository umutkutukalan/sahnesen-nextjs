"use client";

import { useRelativeTime } from "@/hooks/useRelativeTime";
import { PostResponse } from "@/services/server/post.service";
import { JSX, useEffect, useRef, useState } from "react";
import LoadingScreen from "../LoadingScreen";
import { FiUser, FiUserCheck } from "react-icons/fi";
import { TbBookmark, TbBookmarkFilled } from "react-icons/tb";
import { IoIosArrowDown, IoIosMore } from "react-icons/io";
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
import { RiUserSmileFill, RiUserSmileLine } from "react-icons/ri";
import { MdCoffee, MdOutlineCoffee } from "react-icons/md";
import {
  PiFeather,
  PiFeatherFill,
  PiHandsClappingDuotone,
  PiHandsClappingFill,
} from "react-icons/pi";
import { ReactionType } from "@/services/client/interaction/interaction.service";
import { IoHeartOutline, IoHeartSharp } from "react-icons/io5";
import Link from "next/link";
import { LuTheater } from "react-icons/lu";
import {
  hali,
  sahnekoltuklari,
  sahnekoltuklaridevami,
  sahnemikrofonu,
  solperde,
} from "@/utils";
import { useAuth } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { CiSettings } from "react-icons/ci";
import { useFollow } from "@/hooks/follow/useFollow";
import { useToProfile } from "@/utils/useToProfile";
import { getFullImageUrl } from "@/utils/image";
import {
  CommentResponse,
  commentService,
} from "@/services/client/comment/comment.service";
import { reportService } from "@/services/client/report/report.service";
import SaveToCollectionModal from "../collections/SaveToCollectionModal";
import { useSidebar } from "@/context/SidebarContext";

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
  const { user } = useAuth();
  const usernameSlug = post.authorUsername;
  const router = useRouter();
  const { ToProfile } = useToProfile();
  const { isSidebarOpen } = useSidebar();
  const isOwnProfile = usernameSlug === user?.username;
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false); // Silme onay modalı için
  const [savingPostId, setSavingPostId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Dışarı tıklandığında menüyü kapatma useEffect'i (PostCard'da da vardı)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
    markReported,
    markBookmarked,
  } = usePostInteraction(post.id, currentShineType);

  console.log("status", status);

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

  useEffect(() => {
    const fetchComments = async () => {
      if (!post?.id) return;
      try {
        const commentsRes = await commentService.getComments(post.id);
        setComments(commentsRes);
      } catch (err) {
        console.error("Yorumlar yüklenirken hata:", err);
      }
    };

    fetchComments();
  }, [post?.id]);

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
                  className={`my-8 flex flex-col items-center transition-all duration-300 ${
                    isFull
                      ? "relative w-screen left-1/2 -translate-x-1/2"
                      : isMedium
                        ? "relative left-1/2 -translate-x-1/2 w-[120%]"
                        : "w-full"
                  }`}
                  style={{
                    width: isFull && isSidebarOpen ? "calc(100vw - 240px)" : "",
                  }}
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

  const handleReportSubmit = async () => {
    if (!reportReason.trim()) return;
    try {
      setIsReporting(true);
      await reportService.createReport({
        targetId: post.id,
        reportType: "POST",
        reason: reportReason,
      });

      // 1. Hook üzerinden state'i anında güncelle (Refreshi beklemez)
      markReported();

      alert("İçerik başarıyla raporlandı. İncelemeye alınacaktır.");
      setShowReportModal(false);
      setReportReason("");
    } catch (error: any) {
      console.error("Rapor gönderilemedi:", error);
      // Eğer backend'den zaten raporlandı hatası gelirse de UI'ı kilitli duruma getir
      if (error.response?.data?.message?.includes("zaten")) {
        markReported();
      }
      alert(
        error.response?.data?.message || "Rapor gönderilirken bir hata oluştu.",
      );
    } finally {
      setIsReporting(false);
    }
  };

  const { isFollowing, toggleFollow, followLoading } = useFollow(usernameSlug);

  const authorFullName =
    `${post.authorName || ""} ${post.authorSurname || ""}`.trim();

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  const authorProfileImgUrl = post.authorProfileImg
    ? post.authorProfileImg.startsWith("http")
      ? post.authorProfileImg
      : `${baseUrl}/${post.authorProfileImg}`
    : null;

  console.log("post", post);

  return (
    <div className="page pt-5 text-black min-h-screen">
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
        <div className="h-full flex flex-col w-full lg:w-[850px] transition-all duration-300 relative px-2">
          {/* YAZAR ÜST BARI */}
          <div className="h-full flex flex-col w-full">
            <div className="relative w-full flex items-center justify-between overflow-hidden h-20">
              {/* <div className="absolute inset-0 w-400 h-full bg-gradient-to-r from-white via-transparent to-transparent z-10"></div>
              <div className="absolute inset-0 w-full h-full">
                <Image
                  src={}
                  alt=""
                  width={2000}
                  height={2000}
                  priority
                  unoptimized
                  className="w-full h-full object-cover"
                />
              </div> */}
              <div className="relative w-full h-full flex items-start justify-between border-b border-gray-200 z-20">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200 cursor-pointer flex items-end justify-center"
                      onClick={() => ToProfile(post.authorUsername)}
                    >
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
                        <span
                          className="text-xs text-gray-700 cursor-pointer"
                          onClick={() => ToProfile(post.authorUsername)}
                        >
                          {authorFullName || "Yazar"}
                        </span>
                        {/* <Image
                          src=""
                          alt="Kurucu Sahne"
                          width={10}
                          height={10}
                          unoptimized
                          className="select-none"
                        /> */}
                      </div>
                      <span
                        className="text-[10px] text-gray-500 cursor-pointer"
                        onClick={() => ToProfile(post.authorUsername)}
                      >
                        @{post.authorUsername}
                      </span>
                    </div>
                  </div>
                  {isOwnProfile ? (
                    <button
                      onClick={() => router.push("/profil/me/settings")}
                      className="px-2 py-0.5 bg-gray-100 text-gray-700 flex items-center justify-center gap-1 border border-gray-300 rounded-sm text-[10px] cursor-pointer transition-colors hover:bg-gray-200"
                    >
                      <CiSettings />
                      <span>Sahneni Düzenle</span>
                    </button>
                  ) : (
                    <button
                      onClick={toggleFollow}
                      disabled={followLoading}
                      className={`px-2 py-0.5 flex items-center justify-center gap-1 border border-gray-300 rounded-sm text-[10px] cursor-pointer transition-colors hover:bg-gray-50 disabled:opacity-50 ${
                        isFollowing
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-white text-green-700 border-gray-300"
                      }`}
                    >
                      {isFollowing ? (
                        <div className="flex items-center gap-1">
                          <FiUserCheck />
                          <span className="text-blue-700">Takiptesin</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <IoIosArrowDown className="text-green-700" />
                          <span className="text-green-700">Takip Et</span>
                        </div>
                      )}
                    </button>
                  )}
                  {/* <span className="text-xs">•</span>
                    <span className="text-[10px] ">
                      {followCounts?.followerCount || 0} Takipçi
                    </span> */}
                </div>
              </div>
            </div>

            {/* BAŞLIK VE METADATA */}
            <div className="relative flex flex-col gap-6 border-b py-4 border-gray-200">
              <div className="flex flex-col gap-3">
                <h1
                  className="text-[32px] md:text-[42px] merriweather-sans font-semibold z-10"
                  style={{ lineHeight: "48px", letterSpacing: "-0.03em" }}
                >
                  {post.title}
                </h1>
                {subtitle && (
                  <p className="text-[18px] md:text-[22px] text-gray-500 font-normal leading-snug tracking-tight">
                    {subtitle}
                  </p>
                )}
              </div>

              <div className="relative flex items-center justify-between gap-1">
                <div
                  className="absolute left-0 top-0 w-5 h-5 bg-black"
                  style={{
                    maskImage: `url(${solperde.src})`,
                    WebkitMaskImage: `url(${solperde.src})`,
                    maskSize: "contain",
                    WebkitMaskSize: "contain",
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat",
                    maskPosition: "center",
                    WebkitMaskPosition: "center",
                  }}
                />
                <div
                  className="flex items-center gap-2 text-xs text-gray-500 select-none"
                  style={{
                    paddingLeft: "12px",
                  }}
                >
                  {/* <p>5 min read</p>
                <span>•</span> */}
                  <span className="text-black pr-2 border-r border-gray-200">
                    {formatRelativeTime(post.createdAt)}
                  </span>
                  {post.viewCount !== undefined && post.viewCount !== null && (
                    <>
                      <div className="relative flex items-center gap-2">
                        <LuTheater className="text-sm text-black" />
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-black">
                            {formatCount(post.viewCount || 0)}
                          </span>
                          <span>gösterim</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {post.tags?.map((tag, index) => (
                    <Link
                      key={index}
                      href={`/tag/${tag}`}
                      className="px-2 py-1 rounded-sm border border-gray-200 flex items-center justify-center text-xs text-gray-500 list-none"
                    >
                      <li>{tag}</li>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* GÜNCELLENMİŞ BEĞENİ, PARLATMA VE KAYDETME BARI */}
            <div className="h-14 w-full flex  py-2.5 justify-between border-b border-gray-200 select-none">
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
                  onClick={() => {
                    if (status.isBookmarked) {
                      // Zaten kayıtlıysa direkt genel toggle ile kayıttan çıkar
                      toggleBookmark();
                    } else {
                      // Kayıtlı değilse direkt koleksiyon seçim modalını aç
                      setSavingPostId(post.id);
                    }
                  }}
                  disabled={isInteractionLoading}
                  className="transition-colors cursor-pointer"
                  title={status.isBookmarked ? "Kaydedildi" : "Kaydet"}
                >
                  {status.isBookmarked ? (
                    <TbBookmarkFilled className="text-xl text-black scale-110 transition-transform" />
                  ) : (
                    <TbBookmark
                      onClick={() => setSavingPostId(post.id)}
                      className="text-xl hover:scale-110 transition-transform"
                    />
                  )}
                </button>

                <div ref={menuRef} className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="text-2xl text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                  >
                    <IoIosMore />
                  </button>

                  {isMenuOpen && (
                    <div
                      className="absolute right-0 top-full mt-2 w-48 bg-white rounded-sm z-50 px-4 py-3 gap-2 flex flex-col"
                      style={{
                        boxShadow: "0px 0px 5px 1px rgba(0, 0, 0, 0.1)",
                        border: "1px solid #f3f4f6",
                      }}
                    >
                      {user?.username !== post?.authorUsername ? (
                        /* --- BAŞKASININ GÖNDERİSİ: RAPORLAMA SEÇENEĞİ --- */
                        <>
                          {status.isReported ? (
                            <div className="w-full text-left text-xs text-gray-400 cursor-pointer flex items-center gap-2 select-none">
                              <span>Bu içeriği raporladınız</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setIsMenuOpen(false);
                                setShowReportModal(true);
                              }}
                              className="w-full text-left text-xs text-red-600 hover:text-red-800 transition-colors cursor-pointer flex items-center gap-2"
                            >
                              <span>Rapor Et</span>
                            </button>
                          )}
                        </>
                      ) : (
                        /* --- KENDİ GÖNDERİMİZ: DÜZENLE, ARŞİVLE, SİL MENÜSÜ --- */
                        <>
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

                          <button
                            onClick={() => {
                              // Arşivleme fonksiyonunu buraya bağlayabilirsin
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
                              setShowConfirm(true); // Silme onay modalı state'i
                              setIsMenuOpen(false);
                            }}
                            className="flex items-center text-xs transition text-left cursor-pointer"
                            style={{ color: "#b94445" }}
                          >
                            <span>Sahneyi Sil</span>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* REAL TIPTAP İÇERİK ALANI */}
          <div className="prose max-w-none antialiased playfair-display-400 bg-white pb-10 z-20">
            {renderTiptapContent(post.content)}
          </div>

          <div className="relative w-full border-t border-gray-400 mx-auto px-6 lg:px-0 lg:w-[800px] bg-private text-black flex flex-col justify-center overflow-hidden">
            <div className="relative">
              <div className="relative">
                <div className="absolute top-16 right-10 pointer-events-none z-10">
                  <Image src={sahnemikrofonu} alt="" className="w-45" />

                  <div className="absolute top-5 right-10 w-7 h-7 rounded-full overflow-hidden">
                    <img
                      src={getFullImageUrl(post?.authorProfileImg)!}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="absolute top-7 right-0 pointer-events-none">
                <Image src={hali} alt="" className="w-80" />
              </div>

              {/* Ana kapsayıcı */}
              <div className="relative flex flex-col justify-between">
                {/* Koltukların bulunduğu üst/görsel alan (Taşmaları gizlemek için overflow-hidden eklendi) */}
                <div className="relative h-36 overflow-hidden">
                  <div className="absolute top-0 -left-0 rotate-[-15deg] pointer-events-none">
                    <Image src={sahnekoltuklari} alt="" className="w-100" />
                  </div>
                  <div className="absolute -top-1 -left-8 rotate-[-15deg] pointer-events-none">
                    <Image
                      src={sahnekoltuklaridevami}
                      alt=""
                      className="w-100"
                    />
                  </div>
                  <div className="absolute -top-4 -left-8 rotate-[-15deg] pointer-events-none">
                    <Image
                      src={sahnekoltuklaridevami}
                      alt=""
                      className="w-100"
                    />
                  </div>
                  <div className="absolute -top-8 -left-8 rotate-[-15deg] pointer-events-none">
                    <Image
                      src={sahnekoltuklaridevami}
                      alt=""
                      className="w-100"
                    />
                  </div>
                  <div className="absolute top-22 left-35 -rotate-15 pointer-events-auto z-20">
                    {(() => {
                      const uniqueAuthors = Array.from(
                        new Map(
                          comments.map((comment) => [
                            comment.authorUsername,
                            comment,
                          ]),
                        ).values(),
                      );

                      if (uniqueAuthors.length === 0) return null;

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

                {/* Yazı ve Buton Alanı */}
                <div className="relative flex flex-col gap-1 pb-8">
                  <h3 className="text-xl font-bold text-gray-900 font-sans">
                    Sahnenin Arkası: Fuaye
                  </h3>
                  <p className="text-[10px] text-gray-500 max-w-md">
                    Bu içeriğe özel açılan fuaye alanında notlarını bırakabilir
                    veya erken saatlerde bırakılan notların altına yanıt
                    verebilirsin.
                  </p>
                  <Link
                    href={`/posts/${post.slug}/foyer`}
                    className="w-fit mt-1 px-3 py-1.5 bg-black text-white text-xs rounded-sm hover:bg-gray-800 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    Fuayeye Gir
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        {showReportModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96 flex flex-col gap-4 shadow-xl">
              <h3 className="text-sm font-semibold text-gray-800">
                İçeriği Rapor Et
              </h3>
              <p className="text-xs text-gray-500">
                Bu gönderiyi neden rapor etmek istiyorsunuz? Lütfen kısaca
                açıklayın.
              </p>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Rapor sebebi..."
                className="w-full h-24 border border-gray-300 rounded p-2 text-xs resize-none focus:outline-none focus:border-black text-black"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setReportReason("");
                  }}
                  disabled={isReporting}
                  className="px-3 py-1.5 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 cursor-pointer"
                >
                  İptal
                </button>
                <button
                  onClick={handleReportSubmit}
                  disabled={isReporting || !reportReason.trim()}
                  className="px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer disabled:opacity-50"
                >
                  {isReporting ? "Gönderiliyor..." : "Gönder"}
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
            onSaved={() => markBookmarked(true)}
          />
        )}
      </div>
    </div>
  );
};

export default Detail;
