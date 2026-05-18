// src/app/.../CreateProjectsBlog.tsx
"use client";

import dynamic from 'next/dynamic';
import { useState, useRef } from 'react';
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
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // 🔥 MİMARİNİN KALBİ: O an işlem gören postun veri tabanı ID'si
  const [activePostId, setActivePostId] = useState<number | null>(null);
  const [isDraftCreating, setIsDraftCreating] = useState(false);

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Başlık yazıldığında veya editör tetiklendiğinde otomatik sessiz taslak (Auto-Draft) oluşturur
  const ensureDraftExists = async () => {
    if (activePostId || isDraftCreating) return;
    
    const currentTitle = titleRef.current?.value.trim();
    if (!currentTitle || currentTitle.length < 3) return;

    setIsDraftCreating(true);
    try {
      const payload = {
        postType: postType,
        title: currentTitle,
        content: { type: "doc", content: [] }, // Boş Tiptap Başlangıç Objesi
        coverImage: null,
        isPublished: false // 🔥 Kesinlikle Taslak kalacak!
      };

      const response = await axios.post("http://localhost:8080/api/posts/me", payload, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data && response.data.id) {
        setActivePostId(response.data.id);
        console.log("Sahnesen Motoru: Arka planda taslak başarıyla ayrıldı. ID:", response.data.id);
      }
    } catch (err) {
      console.error("Taslak kaydı oluşturulurken arka plan kilitlendi:", err);
    } finally {
      setIsDraftCreating(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // 🔥 YAYINLAMA: Artık sıfırdan oluşturmuyor, var olan activePostId taslağını UPDATE ediyor!
  const handleSave = async () => {
    if (!titleRef.current?.value.trim()) {
      alert("Lütfen önce şık bir başlık girin!");
      return;
    }
    if (!editorJSON) {
      alert("İçerik alanı boş bırakılamaz.");
      return;
    }

    try {
      const payload = {
        postType: postType,
        title: titleRef.current.value,
        content: editorJSON, // Saf Nesne (Map karşılayacak)
        coverImage: null,
        isPublished: true // 🔥 Artık sahneye çıkma vakti, true!
      };

      let response;
      
      if (activePostId) {
        // Eğer içeride drop/paste ile taslak ID'miz oluştuysa PUT (Update) atıyoruz
        response = await axios.put(`http://localhost:8080/api/posts/me/${activePostId}`, payload, {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        // Eğer kullanıcı hiç resim atmadıysa ve direkt kaydete bastıysa POST atıyoruz
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
      console.error("Post güncellenirken/oluşturulurken backend patladı:", error);
      if (error.response?.data) {
        alert(`Backend Hatası: ${JSON.stringify(error.response.data)}`);
      } else {
        alert("Post kaydedilirken bir hata oluştu.");
      }
    }
  };

  return (
    <main className="min-h-screen bg-white pt-24 pb-18 text-black">
      <div className="max-w-3xl mx-auto px-6">

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

        {/* KAPAK RESMİ */}
        <div className="mb-8">
          <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
          {imagePreview ? (
            <div className="relative w-full h-64 rounded-xl overflow-hidden group shadow-md">
              <img src={imagePreview} alt="Kapak" className="w-full h-full object-cover" />
              <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-sm font-medium">
                Görseli Değiştir
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full h-40 border border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-all text-xs">
              <LuImagePlus size={24} />
              <span>Kapak Görseli Ekle</span>
            </button>
          )}
        </div>

        {/* BAŞLIK INPUTU */}
        <textarea
          ref={titleRef}
          placeholder="Başlık girin..."
          rows={1}
          className="w-full text-5xl font-semibold placeholder-gray-300 focus:outline-none resize-none mb-6 tracking-tight"
          onBlur={ensureDraftExists} // 🔥 Başlıktan çıkınca taslağı ayarla!
          onChange={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
        />

        {/* TIPTAP EDITOR EDİTÖRÜ */}
        {/* 🔥 Artık activePostId durumunu içeriye aktarıyoruz */}
        <TiptapEditor onUpdate={(json) => { setEditorJSON(json); ensureDraftExists(); }} postId={activePostId} />

        {/* DEBUG ALANI */}
        <div className="mt-20 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-[10px] font-mono text-gray-400 mb-2 underline">MİMARİ KONTROL</p>
          <div className="text-[10px] text-gray-500 flex flex-col gap-1 font-mono">
            <p><strong>Active Post ID (Taslak):</strong> {activePostId ? activePostId : "Henüz Oluşturulmadı (Başlık veya Metin girin)"}</p>
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