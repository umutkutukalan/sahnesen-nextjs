"use client";

import dynamic from 'next/dynamic';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GoCheck } from "react-icons/go"; // GoCloudDownload yerine GoCheck kalsın veya alttaki importu kullanalım
import { AiOutlineLoading3Quarters, AiOutlineCloudSync, AiOutlineCheckCircle } from "react-icons/ai"; // Güvenli ikon seti
import axios from 'axios';
import EditorNavbar from '@/components/navbar/editor-navbar/EditorNavbar';

const TiptapEditor = dynamic(() => import('@/components/editor/TiptapEditor'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-50 animate-pulse rounded-xl" />
});

const extractTitle = (json: any): string => {
  const first = json?.content?.[0];
  if (first?.type === 'heading' && first?.attrs?.level === 1) {
    return first.content?.map((n: any) => n.text || '').join('') || '';
  }
  return '';
};

type SaveStatus = 'IDLE' | 'SAVING' | 'SAVED' | 'ERROR';

const CreateProjectsBlog = () => {
  const router = useRouter();

  const [editorJSON, setEditorJSON] = useState<any>(null);
  const editorJSONRef = useRef(editorJSON);
  useEffect(() => { editorJSONRef.current = editorJSON; }, [editorJSON]);

  const [postType, setPostType] = useState<'PROJECT' | 'BLOG'>('PROJECT');
  const postTypeRef = useRef(postType);
  useEffect(() => { postTypeRef.current = postType; }, [postType]);

  const [activePostId, setActivePostId] = useState<number | null>(null);
  const activePostIdRef = useRef<number | null>(null);

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('IDLE');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Taslak Oluşturucu
  const ensureDraftExistsRef = useRef(async (currentJson?: any) => {
    if (activePostIdRef.current) return;
    const json = currentJson || editorJSONRef.current;
    const currentTitle = extractTitle(json);
    if (!currentTitle || currentTitle.length < 3) return;

    setSaveStatus('SAVING');
    try {
      const response = await axios.post("http://localhost:8080/api/posts/me", {
        postType: postTypeRef.current,
        title: currentTitle,
        content: json,
        isPublished: false
      }, { withCredentials: true, headers: { 'Content-Type': 'application/json' } });
      if (response.data?.id) {
        activePostIdRef.current = response.data.id;
        setActivePostId(response.data.id);
        setSaveStatus('SAVED');
      }
    } catch (err) {
      console.error(err);
      setSaveStatus('ERROR');
    }
  });

  // Otomatik Kaydediciyi bu mantığa çekebilirsin
  const autoSaveContentRef = useRef(async (currentJson: any) => {
    if (!activePostIdRef.current) return;

    // Eğer kullanıcı her şeyi sildiyse başlığı kurtaralım
    const extracted = extractTitle(currentJson);
    const finalTitle = extracted && extracted.length >= 3 ? extracted : "Başlıksız Taslak";

    try {
      await axios.put(`http://localhost:8080/api/posts/me/${activePostIdRef.current}`, {
        postType: postTypeRef.current,
        title: finalTitle,
        content: currentJson, // Boş içerik (sadece boş bir node) gidebilir, sorun değil
        isPublished: false
      }, { withCredentials: true, headers: { 'Content-Type': 'application/json' } });

      setSaveStatus('SAVED');
    } catch (err) {
      console.error(err);
      setSaveStatus('ERROR');
    }
  });

  // Editor Güncelleme Motoru
  const handleEditorUpdate = useCallback((json: any) => {
    setEditorJSON(json);

    if (!activePostIdRef.current) {
      ensureDraftExistsRef.current(json);
    } else {
      setSaveStatus('SAVING');
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

      // Süreyi 1500ms'e çekerek Tiptap'ın DOM'u rahatça işlemesine izin veriyoruz
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

  const handleSave = async () => {
    const currentId = activePostIdRef.current || activePostId;
    try {
      const payload = {
        postType: postTypeRef.current,
        title: extractTitle(editorJSONRef.current) || "Başlıksız",
        content: editorJSONRef.current,
        isPublished: true
      };

      let response;
      if (currentId) {
        response = await axios.put(`http://localhost:8080/api/posts/me/${currentId}`, payload, {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        response = await axios.post("http://localhost:8080/api/posts/me", payload, {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (response.status === 200 || response.status === 201) {
        alert("Harika! İçerik sahneye başarıyla gönderildi.");
        router.push("/akis");
      }
    } catch (error: any) {
      console.error("Yayınlama hatası:", error);
    }
  };

  return (
    <main className="min-h-screen bg-white pt-24 pb-18 text-black">

      <EditorNavbar transparent={false} contentStatus={saveStatus} activePostId={activePostId} handleSave={handleSave} />

      <div className="w-full lg:w-190 mx-auto px-6">

        {/* ÜST BAR */}
        <div className="flex items-center justify-between mb-8 select-none">
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-max text-xs font-medium">
            <button
              type="button"
              onClick={() => setPostType('PROJECT')}
              className={`px-4 py-1.5 rounded-md transition-all cursor-pointer ${postType === 'PROJECT' ? 'bg-white shadow-sm text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Proje
            </button>
            <button
              type="button"
              onClick={() => setPostType('BLOG')}
              className={`px-4 py-1.5 rounded-md transition-all cursor-pointer ${postType === 'BLOG' ? 'bg-white shadow-sm text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Blog Yazısı
            </button>
          </div>
        </div>

        {/* TIPTAP EDITOR */}
        <TiptapEditor
          onUpdate={handleEditorUpdate}
          postId={activePostId}
        />

        {/* DEBUG ALANI */}
        <div className="mt-20 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-[10px] font-mono text-gray-400 mb-2 underline">MİMARİ KONTROL</p>
          <div className="text-[10px] text-gray-500 flex flex-col gap-1 font-mono">
            <p><strong>Active Post ID (Taslak):</strong> {activePostId ?? "Henüz Oluşturulmadı"}</p>
            <p><strong>Kaydetme Durumu:</strong> {saveStatus}</p>
            <p><strong>Tiptap Node Sayısı:</strong> {editorJSON?.content?.length || 0}</p>
          </div>
        </div>

      </div>

      <button onClick={handleSave} className="fixed bottom-10 right-10 w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-[60] cursor-pointer">
        <GoCheck size={30} />
      </button>
    </main>
  );
};

export default CreateProjectsBlog;