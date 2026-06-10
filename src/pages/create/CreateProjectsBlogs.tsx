"use client";

import dynamic from 'next/dynamic';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { GoCheck } from "react-icons/go";
import { LuImagePlus } from "react-icons/lu";
import axios from 'axios';

const TiptapEditor = dynamic(() => import('@/components/editor/TiptapEditor'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-50 animate-pulse rounded-xl" />
});

const CreateProjectsBlog = () => {
  const router = useRouter();
  const [editorJSON, setEditorJSON] = useState<any>(null);
  const [postType, setPostType] = useState<'PROJECT' | 'BLOG'>('PROJECT');

  const [activePostId, setActivePostId] = useState<number | null>(null);
  const [isDraftCreating, setIsDraftCreating] = useState(false);

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const activePostIdRef = useRef<number | null>(null);

  const extractTitle = (json: any): string => {
    const first = json?.content?.[0];
    if (first?.type === 'heading' && first?.attrs?.level === 1) {
      return first.content?.map((n: any) => n.text || '').join('') || '';
    }
    return '';
  };

  // Sadece başlık girildiğinde veya kapak eklendiğinde İLK taslağı (POST) oluşturur
  const ensureDraftExists = async (currentJson?: any) => {
    if (activePostIdRef.current || activePostId || isDraftCreating) return;
    const json = currentJson || editorJSON;
    const currentTitle = extractTitle(json);
    if (!currentTitle || currentTitle.length < 3) return;

    setIsDraftCreating(true);
    try {
      const payload = {
        postType: postType,
        title: currentTitle,
        content: editorJSON || { type: "doc", content: [] },
        coverImage: null,
        isPublished: false
      };

      const response = await axios.post("http://localhost:8080/api/posts/me", payload, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data && response.data.id) {
        const newId = response.data.id;
        activePostIdRef.current = newId;
        setActivePostId(newId);
        console.log("Sahne Motoru: İlk taslak başarıyla ayrıldı. ID:", newId);
      }
    } catch (err) {
      console.error("Taslak kaydı oluşturulurken kilitlenme yaşandı:", err);
    } finally {
      setIsDraftCreating(false);
    }
  };

  // 🔥 YENİ: Editör değiştikçe var olan taslağı sessizce güncelleyen (PUT) mekanizma
  const autoSaveContent = async (currentJson: any) => {
    const currentId = activePostIdRef.current;
    if (!currentId) return; // Taslak yoksa asenkron istek atıp sistemi yorma

    try {
      await axios.put(`http://localhost:8080/api/posts/me/${currentId}`, {
        postType: postType,
        title: extractTitle(currentJson) || "Başlıksız Taslak",
        content: currentJson,
        isPublished: false
      }, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });
      console.log("Sahne Motoru: İçerik arka planda güncellendi (PUT).");
    } catch (err) {
      console.error("Otomatik kayıtta hata:", err);
    }
  };

  const handleSave = async () => {
    if (!titleRef.current?.value.trim()) {
      alert("Lütfen önce şık bir başlık girin!");
      return;
    }
    const currentId = activePostIdRef.current || activePostId;

    try {
      const payload = {
        postType: postType,
        title: titleRef.current.value,
        content: editorJSON,
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

  // 🔥 RE-RENDER KİLİDİ: useCallback kullanarak fonksiyon referansını sabitliyoruz
  const handleEditorUpdate = useCallback((json: any) => {
    setEditorJSON(json);
    ensureDraftExists(json); // taslak tetikleme
    autoSaveContent(json); // Her harfte veya resimde Create (POST) değil, sessizce PUT atıyoruz.
  }, [postType]);

  return (
    <main className="min-h-screen bg-white pt-24 pb-18 text-black">
      <div className="w-full lg:w-190 mx-auto px-6">

        {/* TYPE SELECTOR */}
        <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-lg w-max text-xs font-medium">
          <button
            type="button"
            onClick={() => setPostType('PROJECT')}
            className={`px-4 py-1.5 rounded-md transition-all ${postType === 'PROJECT' ? 'bg-white shadow-sm text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Proje
          </button>
          <button
            type="button"
            onClick={() => setPostType('BLOG')}
            className={`px-4 py-1.5 rounded-md transition-all ${postType === 'BLOG' ? 'bg-white shadow-sm text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Blog Yazısı
          </button>
        </div>

        {/* BAŞLIK INPUTU */}
        <textarea
          ref={titleRef}
          placeholder="Başlık girin..."
          rows={1}
          className="w-full text-5xl font-semibold placeholder-gray-300 focus:outline-none resize-none mb-6 tracking-tight"
          onBlur={ensureDraftExists} // 🔥 En güvenli yer: Kullanıcı başlıktan çıkınca ilk taslak oluşur.
          onChange={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
        />

        {/* TIPTAP EDITOR */}
        <TiptapEditor
          onUpdate={handleEditorUpdate}
          postId={activePostIdRef.current || activePostId}
        />

        {/* DEBUG ALANI */}
        <div className="mt-20 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-[10px] font-mono text-gray-400 mb-2 underline">MİMARİ KONTROL</p>
          <div className="text-[10px] text-gray-500 flex flex-col gap-1 font-mono">
            <p><strong>Active Post ID (Taslak):</strong> {activePostIdRef.current || activePostId ? (activePostIdRef.current || activePostId) : "Henüz Oluşturulmadı"}</p>
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