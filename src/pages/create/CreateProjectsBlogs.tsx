// src/app/olustur/page.tsx
"use client";
import dynamic from 'next/dynamic';
import { useState, useRef } from 'react';
import { GoCheck } from "react-icons/go";

// SSR Hatasını önlemek için Dynamic Import şart!
const TiptapEditor = dynamic(() => import('@/components/editor/TiptapEditor'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-50 animate-pulse rounded-xl" />
});

const CreateProjectsBlog = () => {
  const [editorJSON, setEditorJSON] = useState<any>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  const handleSave = async () => {
    const payload = {
      title: titleRef.current?.value,
      content: JSON.stringify(editorJSON), // Java tarafına Stringified JSON gönderiyoruz
      createdAt: new Date().toISOString(),
    };

    console.log("Java Spring Boot'a Hazır Paket:", payload);
    // Buraya axios.post("/api/posts", payload) gelecek
  };

  return (
    <main className="min-h-screen bg-white pt-24 pb-18">
      <div className="max-w-3xl mx-auto px-6">

        {/* Başlık: Sınırları olmayan, Apple minimalist girişi */}
        <textarea
          ref={titleRef}
          placeholder="Title"
          rows={1}
          className="w-full text-5xl font-semibold placeholder-gray-400 focus:outline-none resize-none playfair-display-400"
          onChange={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
        />

        {/* Editör: Alt katmanda Tiptap çalışıyor */}
        <TiptapEditor onUpdate={setEditorJSON} />

        {/* Geliştirme aşamasında veriyi görmek için */}
        <div className="mt-20 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-xs font-mono text-gray-400 mb-2 underline">BACKEND'E GİDECEK JSON TASLAĞI:</p>
          <pre className="text-[10px] text-gray-600 overflow-auto max-h-40">
            {JSON.stringify(editorJSON, null, 2)}
          </pre>
        </div>

      </div>

      {/* Onay Butonu: Sağ alt köşede yüzen minimalist buton */}
      <button
        onClick={handleSave}
        className="fixed bottom-10 right-10 w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-[60]"
      >
        <GoCheck size={30} />
      </button>
    </main>
  );
};

export default CreateProjectsBlog;