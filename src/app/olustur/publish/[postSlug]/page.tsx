"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { IoClose } from "react-icons/io5";
import { PostResponse } from "@/services/server/post.service";
import {
  getPostBySlugClient,
  updatePostClient,
} from "@/services/client/post.service";

export default function PublishPage() {
  const params = useParams();
  const router = useRouter();
  const postSlug = params.postSlug as string;

  console.log("Gelen params:", params);
  console.log("Yakalanan slug/id değeri:", postSlug);

  const [post, setPost] = useState<PostResponse | null>(null);
  const [subtitle, setSubtitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        setLoading(true);
        const data = await getPostBySlugClient(postSlug);
        setPost(data);
        setSubtitle(data.subtitle || "");
        setTags(data.tags || []);
      } catch (error) {
        console.error("Yazı detayları yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    if (postSlug) {
      fetchPostDetails();
    }
  }, [postSlug]);

  // Etiket ekleme
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (tags.length < 5 && !tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
        setTagInput("");
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Yayınla Aksiyonu
  const handlePublish = async () => {
    if (!post?.id) return; // ID garantisi

    try {
      setIsSubmitting(true);
      await updatePostClient(post.id, {
        ...post,
        subtitle,
        tags,
        isPublished: true,
      });
      router.push("/"); // Yayınlandıktan sonra ana sayfaya veya akışa yönlendir
    } catch (error) {
      console.error("Yayınlama başarısız:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-400 text-sm">
        Sahne hazırlanıyor...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      {/* Üst Bar / Kapatma Butonu */}
      <div className="flex items-center justify-end p-6 max-w-5xl w-full mx-auto">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-black transition-colors cursor-pointer p-2"
        >
          <IoClose size={28} />
        </button>
      </div>

      {/* Ana İçerik - İki Sütunlu Medium Tarzı Yerleşim */}
      <div className="max-w-5xl w-full mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 py-4">
        {/* Sol Sütun: Story Preview ve Kapak Görselleri */}
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-serif font-bold">Story preview</h2>

          {/* Kapak Görseli Alanı */}
          <div className="w-full h-64 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 p-6 text-center overflow-hidden relative">
            {post?.coverImage ? (
              <img
                src={post.coverImage}
                alt="Cover"
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <p className="text-sm">
                Yazınıza henüz kapak görseli eklenmemiş.
              </p>
            )}
          </div>

          <div className="text-xs text-gray-400 leading-relaxed">
            {
              "Note: Changes here will affect how your story appears in public places like homepage and subscriber's inboxes."
            }
          </div>
        </div>

        {/* Sağ Sütun: Etiketler, Subtitle ve Yayınla Butonları */}
        <div className="flex flex-col gap-8">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Topics (Max 5)
            </label>
            <div className="p-2 border border-gray-200 rounded-xl min-h-[50px] bg-white flex flex-wrap gap-2 items-center">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1"
                >
                  #{tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="text-gray-400 hover:text-black ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
              {tags.length < 5 && (
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder={
                    tags.length === 0
                      ? "Add up to five topics..."
                      : "Add another..."
                  }
                  className="text-sm outline-none flex-1 min-w-[120px] px-2 py-1 bg-transparent"
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Subtitle (Alt Başlık)
            </label>
            <textarea
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              rows={4}
              className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-green-800 resize-none"
              placeholder="Yazınızı kısaca özetleyin..."
            />
          </div>

          {/* Aksiyon Butonları */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
            <button
              onClick={handlePublish}
              disabled={isSubmitting}
              className="bg-green-800 text-white text-sm px-6 py-2.5 rounded-xl hover:bg-green-700 transition-all font-medium cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Yayınlanıyor..." : "Publish now"}
            </button>
            <button className="text-sm text-green-800 hover:underline cursor-pointer">
              Schedule for later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
