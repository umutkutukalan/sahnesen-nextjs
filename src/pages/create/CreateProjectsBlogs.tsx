"use client";

import dynamic from 'next/dynamic';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { GoCheck } from "react-icons/go";
import { LuImagePlus } from "react-icons/lu";
import axios from 'axios';

// SSR Hatasını önlemek için Dynamic Import şart!
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

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Kapak resmi seçildiğinde önizleme oluşturur
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

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
        content: editorJSON,
        coverImage: null,
        isPublished: true
      };

      console.log("Sahnesen Motoru: Test payload gönderiliyor...", payload);

      const response = await axios.post("http://localhost:8080/api/posts/me", payload, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200 || response.status === 201) {
        alert("Harika! İçerik sahneye başarıyla gönderildi.");
        router.push("/akis");
      }

    } catch (error: any) {
      console.error("Post oluşturulurken backend patladı:", error);
      // EĞER BACKEND HATA DETAYI DÖNÜYORSA ALERT İÇİNDE GÖRELİM
      if (error.response?.data) {
        console.log("Backend Validation Hata Detayı:", error.response.data);
        alert(`Backend Hatası: ${JSON.stringify(error.response.data)}`);
      } else {
        alert("Post kaydedilirken bir hata oluştu. Konsolu incele Umut!");
      }
    }
  };

  return (
    <main className="min-h-screen bg-white pt-24 pb-18 text-black">
      <div className="max-w-3xl mx-auto px-6">

        {/* MINIMALIST TYPE SELECTOR (Apple Style Toggle) */}
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

        {/* DİNAMİK KAPAK RESMİ YÜKLEME ALANI */}
        <div className="mb-8">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />
          {imagePreview ? (
            <div className="relative w-full h-64 rounded-xl overflow-hidden group shadow-md">
              <img src={imagePreview} alt="Kapak Önizleme" className="w-full h-full object-cover" />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-sm font-medium"
              >
                Görseli Değiştir
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-40 border border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-all text-xs"
            >
              <LuImagePlus size={24} />
              <span>Kapak Görseli Ekle (Minimalist Önizleme İçin)</span>
            </button>
          )}
        </div>

        {/* BAŞLIK INPUTU */}
        <textarea
          ref={titleRef}
          placeholder="Başlık girin..."
          rows={1}
          className="w-full text-5xl font-semibold placeholder-gray-300 focus:outline-none resize-none mb-6 tracking-tight"
          onChange={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
        />

        {/* TIPTAP EDITOR EDİTÖRÜ */}
        <TiptapEditor onUpdate={setEditorJSON} />

        {/* BACKEND DEBBUGGING AREA */}
        <div className="mt-20 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-[10px] font-mono text-gray-400 mb-2 underline">MİMARİ KONTROL: BACKEND'E GİDECEK PAYLOAD</p>
          <div className="text-[10px] text-gray-500 flex flex-col gap-1 font-mono">
            <p><strong>Post Type:</strong> {postType}</p>
            <p><strong>Has Cover Image:</strong> {coverImage ? "Evet (Multipart)" : "Hayır"}</p>
            <p><strong>Tiptap Node Sayısı:</strong> {editorJSON?.content?.length || 0}</p>
          </div>
        </div>

      </div>

      {/* ONAY BUTONU */}
      <button
        onClick={handleSave}
        className="fixed bottom-10 right-10 w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-[60] cursor-pointer"
        title="Sahneye Gönder!"
      >
        <GoCheck size={30} />
      </button>
    </main>
  );
};

export default CreateProjectsBlog;