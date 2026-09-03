"use client";

import { searchTagsClient } from "@/services/client/tags/tag.service";
import { useState, useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (tags: string[], finalSubtitle: string) => void;
  initialSubtitle: string;
}

export default function PublishModal({
  isOpen,
  onClose,
  onPublish,
  initialSubtitle,
}: PublishModalProps) {
  const [subtitle, setSubtitle] = useState(initialSubtitle || "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSubtitle(initialSubtitle || "");
  }, [initialSubtitle]);

  console.log("suggestion", suggestions);

  // Etiket auto-complete sorgusu
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (tagInput.trim().length > 1) {
        const results = await searchTagsClient(tagInput.trim());
        // Zaten eklenenleri listeden çıkar
        setSuggestions(results.filter((t) => !tags.includes(t)));
      } else {
        setSuggestions([]);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [tagInput, tags]);

  const handleAddTag = (tagName: string) => {
    const cleaned = tagName.trim().toLowerCase();
    if (cleaned && !tags.includes(cleaned) && tags.length < 5) {
      setTags([...tags, cleaned]);
      setTagInput("");
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  const removeTag = (indexToRemove: number) => {
    setTags(tags.filter((_, idx) => idx !== indexToRemove));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white max-w-3xl rounded-2xl shadow-2xl p-6 relative text-black">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
        >
          <IoClose size={24} />
        </button>

        <h2 className="text-xl font-bold font-serif mb-1">Yazıyı Yayınla</h2>
        <p className="text-sm text-gray-500 mb-6">
          Yazınızın okuyuculara nasıl görüneceğini son kez gözden geçirin.
        </p>

        {/* Alt Başlık Alanı */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
            Alt Başlık (Özet)
          </label>
          <textarea
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            rows={3}
            maxLength={250}
            className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-green-800 transition-colors resize-none"
            placeholder="Yazınızın ne hakkında olduğunu kısaca özetleyin..."
          />
          <div className="text-right text-xs text-gray-400 mt-1">
            {subtitle.length}/250
          </div>
        </div>

        {/* Etiket Ekleme Alanı */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
            Etiketler (En fazla 5 adet)
          </label>

          {/* Kutuyu kapsayan ana div'den 'relative' kaldırıldı veya esnek hale getirildi */}
          <div className="relative">
            <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-200 rounded-xl min-h-[48px] bg-white focus-within:border-green-800 transition-colors">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-green-50 text-green-800 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(idx)}
                    className="hover:text-red-600"
                  >
                    &times;
                  </button>
                </span>
              ))}
              {tags.length < 5 && (
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    tags.length === 0
                      ? "Etiket ekle (Enter veya virgül)..."
                      : ""
                  }
                  className="flex-1 text-sm outline-none bg-transparent min-w-[120px] px-1"
                />
              )}
            </div>

            {/* Öneriler Kutusu - Konumlandırması kesinleştirildi */}
            {suggestions.length > 0 && (
              <div
                ref={suggestionRef}
                className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-40 overflow-y-auto"
              >
                {suggestions.map((sug, idx) => (
                  <div
                    key={idx}
                    onMouseDown={(e) => {
                      // Inputun odak kaybını önlemek için click yerine mousedown kullanıyoruz
                      e.preventDefault();
                      handleAddTag(sug);
                    }}
                    className="px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-900 cursor-pointer transition-colors"
                  >
                    #{sug}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Eylem Butonları */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-3 py-1 text-xs border border-gray-300 rounded-md transition-colors"
          >
            Vazgeç
          </button>
          <button
            onClick={() => {
              setIsSubmitting(true);
              onPublish(tags, subtitle);
            }}
            disabled={isSubmitting}
            className="bg-green-800 text-white text-xs px-3 py-1 rounded-md transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Yayınlanıyor..." : "Sahnele"}
          </button>
        </div>
      </div>
    </div>
  );
}
