"use client";

import dynamic from "next/dynamic";
import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EditorNavbar from "@/components/navbar/editor-navbar/EditorNavbar";
import PublishModal from "@/components/editor/PublishModal";
import {
  createPostClient,
  updatePostClient,
  getPostBySlugClient,
} from "@/services/client/post.service";
import { useAuth } from "@/context/UserContext";
import { useQueryClient } from "@tanstack/react-query";

const TiptapEditor = dynamic(() => import("@/components/editor/TiptapEditor"), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-50 animate-pulse rounded-xl" />,
});

const extractTitle = (json: any): string => {
  const first = json?.content?.[0];
  if (first?.type === "heading" && first?.attrs?.level === 1) {
    return first.content?.map((n: any) => n.text || "").join("") || "";
  }
  return "";
};

const extractSubtitleFromJSON = (json: any): string => {
  if (!json?.content) return "";
  for (let i = 1; i < json.content.length; i++) {
    const node = json.content[i];
    if (node?.type === "paragraph" && node.content) {
      const text = node.content
        .map((n: any) => n.text || "")
        .join("")
        .trim();
      if (text.length > 0) {
        return text.length > 250 ? text.substring(0, 247) + "..." : text;
      }
    }
  }
  return "";
};

type SaveStatus = "IDLE" | "SAVING" | "SAVED" | "ERROR";

const CreateProjectsBlog = () => {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [editorJSON, setEditorJSON] = useState<any>(null);
  const editorJSONRef = useRef(editorJSON);
  useEffect(() => {
    editorJSONRef.current = editorJSON;
  }, [editorJSON]);

  const [postType, setPostType] = useState<string>("SAHNE");
  const [postSlug, setPostSlug] = useState<string | null>(null);
  const postTypeRef = useRef(postType);
  const isCreatingRef = useRef<boolean>(false);

  // Yayınlanmış içerik kontrolü ref'i
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const isPublishedRef = useRef<boolean>(false);
  useEffect(() => {
    isPublishedRef.current = isPublished;
  }, [isPublished]);

  const [activePostId, setActivePostId] = useState<number | null>(null);
  const activePostIdRef = useRef<number | null>(null);

  const [initialContent, setInitialContent] = useState<any>(null);
  const [isLoadingPost, setIsLoadingPost] = useState<boolean>(false);

  // Modal State'leri
  const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);
  const [currentSubtitle, setCurrentSubtitle] = useState<string>("");

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("IDLE");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const slugParam = searchParams?.get("slug");
    const typeParam = searchParams?.get("type");

    if (typeParam) {
      setPostType(typeParam.toUpperCase());
    }

    if (slugParam && !activePostIdRef.current) {
      setPostSlug(slugParam);
      setIsLoadingPost(true);

      getPostBySlugClient(slugParam)
        .then((postData) => {
          if (postData) {
            setActivePostId(postData.id);
            activePostIdRef.current = postData.id;

            if (postData.postType) {
              setPostType(postData.postType);
            }

            if (typeof postData.isPublished === "boolean") {
              setIsPublished(postData.isPublished);
              isPublishedRef.current = postData.isPublished;
            }

            let parsedContent = postData.content;
            if (typeof postData.content === "string") {
              try {
                parsedContent = JSON.parse(postData.content);
              } catch (e) {
                console.error("Content JSON Parse Hatası:", e);
              }
            }

            setInitialContent(parsedContent);
            setEditorJSON(parsedContent);
          }
        })
        .catch((err) => {
          console.error("Slug ile içerik çekilirken hata oluştu:", err);
        })
        .finally(() => {
          setIsLoadingPost(false);
        });
    }
  }, [searchParams]);

  useEffect(() => {
    postTypeRef.current = postType;
  }, [postType]);

  // Sayfadan çıkarken uyarı
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isPublishedRef.current && saveStatus === "IDLE") {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveStatus]);

  // İlk Taslak Oluşturma
  const ensureDraftExistsRef = useRef(async (currentJson?: any) => {
    if (
      activePostIdRef.current ||
      isCreatingRef.current ||
      isPublishedRef.current
    )
      return;

    const json = currentJson || editorJSONRef.current;
    const currentTitle = extractTitle(json);
    if (!currentTitle || currentTitle.trim().length < 3) return;

    isCreatingRef.current = true;
    setSaveStatus("SAVING");

    try {
      const data = await createPostClient({
        postType: postTypeRef.current,
        title: currentTitle,
        content: json,
        isPublished: false,
      });

      if (data?.id) {
        activePostIdRef.current = data.id;
        setActivePostId(data.id);
        setSaveStatus("SAVED");

        if (data.slug) {
          setPostSlug(data.slug);
          router.replace(`/olustur?slug=${data.slug}`, { scroll: false });
        }
      }
    } catch (err) {
      console.error("Taslak oluşturma hatası:", err);
      setSaveStatus("ERROR");
    } finally {
      isCreatingRef.current = false;
    }
  });

  // Otomatik Kaydetme
  const autoSaveContentRef = useRef(async (currentJson: any) => {
    if (!activePostIdRef.current || isPublishedRef.current) return;

    const extracted = extractTitle(currentJson);
    const finalTitle =
      extracted && extracted.trim().length >= 3
        ? extracted
        : "Başlıksız Taslak";

    try {
      await updatePostClient(activePostIdRef.current, {
        postType: postTypeRef.current,
        title: finalTitle,
        content: currentJson,
        isPublished: false,
      });

      setSaveStatus("SAVED");
    } catch (err: any) {
      console.error(
        "Auto-save detaylı hata yanıtı:",
        err?.response?.data || err,
      );
      setSaveStatus("ERROR");
    }
  });

  // Editor Güncelleme Motoru
  const handleEditorUpdate = useCallback((json: any) => {
    setEditorJSON(json);

    if (isPublishedRef.current) {
      setSaveStatus("IDLE");
      return;
    }

    if (!activePostIdRef.current) {
      ensureDraftExistsRef.current(json);
    } else {
      setSaveStatus("SAVING");
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

      debounceTimerRef.current = setTimeout(() => {
        autoSaveContentRef.current(json);
      }, 1500);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  // Modalı Açma Kontrolü
  const handleOpenPublishModal = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const currentTitle = extractTitle(editorJSONRef.current);
    if (!currentTitle || currentTitle.trim().length < 3) {
      alert("Lütfen en az 3 karakterlik bir başlık yazın.");
      return;
    }

    const extractedSubtitle = extractSubtitleFromJSON(editorJSONRef.current);
    setCurrentSubtitle(extractedSubtitle);
    setIsPublishModalOpen(true);
  };

  // Modaldan Gelen Verilerle Kesin Yayınlama/Güncelleme İşlemi
  const handlePublishFinal = async (tags: string[], finalSubtitle: string) => {
    const currentTitle = extractTitle(editorJSONRef.current);
    setSaveStatus("SAVING");

    const payload = {
      postType: postTypeRef.current,
      title: currentTitle,
      subtitle: finalSubtitle,
      tags: tags,
      content: editorJSONRef.current,
      isPublished: true,
    };

    try {
      let savedPost;
      const currentId = activePostIdRef.current || activePostId;

      if (currentId) {
        savedPost = await updatePostClient(currentId, payload);
      } else {
        savedPost = await createPostClient(payload);
      }

      setSaveStatus("SAVED");
      setIsPublishModalOpen(false);

      await queryClient.invalidateQueries({ queryKey: ["userPosts"] });
      router.refresh();

      const username = savedPost?.authorUsername || user?.username;
      const slug = savedPost?.slug;

      if (username && slug) {
        router.push(`/${username}/${slug}`);
      } else {
        router.push("/akis");
      }
    } catch (error: any) {
      console.error("Yayınlama hatası:", error);
      setSaveStatus("ERROR");
    }
  };

  return (
    <main className="min-h-screen bg-white text-black">
      <EditorNavbar
        transparent={false}
        contentStatus={saveStatus}
        activePostId={activePostId}
        postSlug={postSlug}
      />

      <div className="w-full lg:w-[760px] mx-auto px-6 pt-6">
        {isLoadingPost ? (
          <div className="h-64 bg-gray-50 animate-pulse rounded-xl" />
        ) : (
          <TiptapEditor
            onUpdate={handleEditorUpdate}
            postId={activePostId}
            initialContent={initialContent}
          />
        )}
      </div>

      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onPublish={handlePublishFinal}
        initialSubtitle={currentSubtitle}
      />
    </main>
  );
};

export default CreateProjectsBlog;
