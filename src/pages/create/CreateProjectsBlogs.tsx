"use client";

import dynamic from "next/dynamic";
import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EditorNavbar from "@/components/navbar/editor-navbar/EditorNavbar";
import {
  createPostClient,
  updatePostClient,
} from "@/services/client/post.service";
import { useAuth } from "@/context/UserContext";

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

type SaveStatus = "IDLE" | "SAVING" | "SAVED" | "ERROR";

const CreateProjectsBlog = () => {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [editorJSON, setEditorJSON] = useState<any>(null);
  const editorJSONRef = useRef(editorJSON);
  useEffect(() => {
    editorJSONRef.current = editorJSON;
  }, [editorJSON]);

  // Enum değerin "SAHNE" gibi büyük harf olması gerekebilir (Backend DTO PostType kontrolü için)
  const [postType, setPostType] = useState<string>("SAHNE");
  const postTypeRef = useRef(postType);

  useEffect(() => {
    const typeParam = searchParams?.get("type");
    if (typeParam) {
      setPostType(typeParam.toUpperCase());
    }
  }, [searchParams]);

  useEffect(() => {
    postTypeRef.current = postType;
  }, [postType]);

  const [activePostId, setActivePostId] = useState<number | null>(null);
  const activePostIdRef = useRef<number | null>(null);

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("IDLE");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Taslak Oluşturucu (Ilk Defa Post Atma)
  const ensureDraftExistsRef = useRef(async (currentJson?: any) => {
    if (activePostIdRef.current) return;
    const json = currentJson || editorJSONRef.current;
    const currentTitle = extractTitle(json);
    if (!currentTitle || currentTitle.length < 3) return;

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
      }
    } catch (err) {
      console.error("Taslak oluşturma hatası:", err);
      setSaveStatus("ERROR");
    }
  });

  // 2. Otomatik Kaydedici (Var Olan Taslağı Güncelleme)
  const autoSaveContentRef = useRef(async (currentJson: any) => {
    if (!activePostIdRef.current) return;

    const extracted = extractTitle(currentJson);
    const finalTitle =
      extracted && extracted.length >= 3 ? extracted : "Başlıksız Taslak";

    try {
      await updatePostClient(activePostIdRef.current, {
        postType: postTypeRef.current,
        title: finalTitle,
        content: currentJson,
        isPublished: false,
      });

      setSaveStatus("SAVED");
    } catch (err) {
      console.error("Auto-save hatası:", err);
      setSaveStatus("ERROR");
    }
  });

  // 3. Editor Güncelleme Motoru (Debounce)
  const handleEditorUpdate = useCallback((json: any) => {
    setEditorJSON(json);

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

  // 4. Yayınlama (Publish) İşlemi
  const handleSave = async () => {
    // Bekleyen auto-save timer'ı varsa iptal et (Race condition engeli)
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const currentId = activePostIdRef.current || activePostId;
    const payload = {
      postType: postTypeRef.current,
      title: extractTitle(editorJSONRef.current) || "Başlıksız Sahne",
      content: editorJSONRef.current,
      isPublished: true, // Direkt yayınlıyoruz
    };

    try {
      let savedPost;

      if (currentId) {
        savedPost = await updatePostClient(currentId, payload);
      } else {
        savedPost = await createPostClient(payload);
      }

      setSaveStatus("SAVED");

      // Backend'den dönen slug ve username ile dinamik yönlendirme
      // (Eğer response içinde authorUsername yoksa UserContext'ten gelen user.username kullanılabilir)
      const username = savedPost?.authorUsername || user?.username;
      const slug = savedPost?.slug;

      if (username && slug) {
        router.push(`/${username}/${slug}`);
      } else {
        // Yönlendirme bilgisi eksikse fallback olarak profile veya akışa at
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
        handleSave={handleSave}
      />

      <div className="w-full lg:w-[760px] mx-auto px-6 pt-6">
        <TiptapEditor onUpdate={handleEditorUpdate} postId={activePostId} />
      </div>
    </main>
  );
};

export default CreateProjectsBlog;
