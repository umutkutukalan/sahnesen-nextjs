"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { IoClose } from "react-icons/io5";
import { PostResponse } from "@/services/server/post.service";
import {
  getPostBySlugClient,
  updatePostClient,
} from "@/services/client/post.service";

const extractAllImagesFromJSON = (contentJSON: any): string[] => {
  const images: string[] = [];
  const traverse = (node: any) => {
    if (!node) return;
    if (node.type === "image" && node.attrs?.src) {
      images.push(node.attrs.src);
    }
    if (node.content && Array.isArray(node.content)) {
      node.content.forEach(traverse);
    }
  };
  traverse(contentJSON);
  return Array.from(new Set(images));
};

export default function PublishPage() {
  const params = useParams();
  const router = useRouter();
  const postSlug = params?.postSlug as string;

  const [post, setPost] = useState<PostResponse | null>(null);
  const [subtitle, setSubtitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [discussionDurationHours, setDiscussionDurationHours] =
    useState<number>(3);

  // 💡 Çoklu görsel state'leri
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log("post: ", post);

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        setLoading(true);
        const data = await getPostBySlugClient(postSlug);
        setPost(data);
        setSubtitle(data.subtitle || "");
        setTags(data.tags || []);

        if (
          data.discussionDurationHours !== null &&
          data.discussionDurationHours !== undefined
        ) {
          setDiscussionDurationHours(data.discussionDurationHours);
        }

        // 💡 2. Burada data.content string ise parse edip fonksiyona veriyoruz
        let parsedContent = data.content;
        if (typeof parsedContent === "string") {
          try {
            parsedContent = JSON.parse(parsedContent);
          } catch (e) {
            console.error("Content JSON parse edilemedi:", e);
          }
        }

        const allImages = extractAllImagesFromJSON(parsedContent);
        setAvailableImages(allImages);

        if (data.coverImages && data.coverImages.length > 0) {
          setSelectedImages(data.coverImages);
        } else {
          setSelectedImages(allImages.slice(0, 3));
        }
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

  // Görsel seçim/kaldırma mantığı (Max 3 adet)
  const toggleImageSelection = (imgUrl: string) => {
    if (selectedImages.includes(imgUrl)) {
      setSelectedImages(selectedImages.filter((url) => url !== imgUrl));
    } else {
      if (selectedImages.length >= 3) {
        alert("En fazla 3 kapak görseli seçebilirsiniz.");
        return;
      }
      setSelectedImages([...selectedImages, imgUrl]);
    }
  };

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
    if (!post?.id) return;

    try {
      setIsSubmitting(true);
      await updatePostClient(post.id, {
        ...post,
        subtitle,
        tags,
        coverImages: selectedImages, // 💡 Seçilen çoklu görseller gönderiliyor
        discussionDurationHours,
        isPublished: true,
      });
      router.push("/");
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

  const durationOptions = [
    { label: "3 Saat", value: 3 },
    { label: "6 Saat", value: 6 },
    { label: "12 Saat", value: 12 },
    { label: "24 Saat", value: 24 },
    { label: "48 Saat", value: 48 },
    { label: "Süresiz", value: 0 },
  ];

  return (
    <div className="min-h-screen bg-white text-black flex flex-col merriweather-sans">
      {/* Üst Bar */}
      <div className="flex items-center justify-end p-6 max-w-5xl w-full mx-auto">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-black transition-colors cursor-pointer p-2"
        >
          <IoClose size={28} />
        </button>
      </div>

      {/* Ana İçerik */}
      <div className="max-w-5xl w-full mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 py-4">
        {/* Sol Sütun: Çoklu Kapak Görseli Seçimi */}
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold mb-1">Kapak Görselleri (Max 3)</h2>
            <p className="text-xs text-gray-400">
              Yazınızın içinde geçen görsellerden en fazla 3 tanesini fuaye ve
              akış kartları için seçin.
            </p>
          </div>

          {availableImages.length === 0 ? (
            <div className="w-full h-48 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center text-gray-400 p-6 text-center text-sm">
              Yazınızın içinde henüz hiç görsel bulunmuyor.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {availableImages.map((img, index) => {
                const isSelected = selectedImages.includes(img);
                const selectionIndex = selectedImages.indexOf(img) + 1;

                return (
                  <div
                    key={index}
                    onClick={() => toggleImageSelection(img)}
                    className={`relative h-28 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                      isSelected
                        ? "border-green-800 shadow-md scale-[1.02]"
                        : "border-gray-200 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Content img ${index}`}
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-green-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow">
                        {selectionIndex}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="text-xs text-gray-400 leading-relaxed mt-2">
            Seçtiğiniz görseller kart üzerindeki kayan vitrinde bu sırayla
            görüntülenecektir.
          </div>
        </div>

        {/* Sağ Sütun: Etiketler, Subtitle, Süre ve Yayınla */}
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
              rows={3}
              className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-green-800 resize-none"
              placeholder="Yazınızı kısaca özetleyin..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Fuaye / Tartışma Süresi
            </label>
            <div className="grid grid-cols-5 gap-2">
              {durationOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDiscussionDurationHours(opt.value)}
                  className={`py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                    discussionDurationHours === opt.value
                      ? "bg-green-800 text-white border-green-800 shadow-sm"
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
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
