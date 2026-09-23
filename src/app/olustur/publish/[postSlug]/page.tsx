"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { IoClose } from "react-icons/io5";
import { PostResponse } from "@/services/server/post.service";
import {
  getPostBySlugClient,
  updatePostClient,
} from "@/services/client/post.service";
import { formatTag } from "@/utils/tagFormatter";

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
  const [activeImageIndex, setActiveImageIndex] = useState(0);

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
    setSelectedImages((prevSelected) => {
      const isAlreadySelected = prevSelected.includes(imgUrl);

      if (isAlreadySelected) {
        // Eğer son 1 görsel kaldıysa, kaldırılmasına izin verme
        if (prevSelected.length <= 1) {
          return prevSelected;
        }

        // Seçiliyse ve 1'den fazla görsel varsa listeden çıkar
        const updated = prevSelected.filter((item) => item !== imgUrl);
        setActiveImageIndex(0);
        return updated;
      } else {
        // 3'ten fazla seçilmesini engelle
        if (prevSelected.length >= 3) {
          return prevSelected;
        }

        // Yeni görsel ekle
        const updated = [...prevSelected, imgUrl];
        setActiveImageIndex(0);
        return updated;
      }
    });
  };

  // Etiket ekleme
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();

      // Süzgeçten geçiriyoruz
      const cleanedTag = formatTag(tagInput);

      // Eğer temizlendikten sonra boş kalmadıysa ve daha önce eklenmediyse ekle
      if (cleanedTag && !tags.includes(cleanedTag) && tags.length < 5) {
        setTags([...tags, cleanedTag]);
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
    <div className="min-h-screen text-black flex flex-col justify-center merriweather-sans">
      {/* Üst Bar */}
      <div className="flex items-center justify-end max-w-5xl w-full mx-auto">
        <button
          onClick={() => router.back()}
          className="text-gray-700 hover:text-black transition-colors cursor-pointer p-2"
        >
          <IoClose size={24} />
        </button>
      </div>
      {/* Ana İçerik */}
      <div className="max-w-5xl w-full mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 py-4">
        {/* Sol Sütun: Çoklu Kapak Görseli Seçimi */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            {availableImages.length === 0 ? (
              <div className="w-full h-48 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center text-gray-400 p-6 text-center text-sm">
                Yazınızın içinde henüz hiç görsel bulunmuyor.
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {/* 1. SEÇİLEN GÖRSELLERİN YELPAZE ÖNİZLEMESİ */}
                <div className="flex flex-col items-center justify-center">
                  <div
                    className="relative flex items-center justify-center cursor-pointer select-none"
                    style={{ width: "160px", height: "160px" }}
                  >
                    {selectedImages.length > 0 ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        {selectedImages.map((imgUrl, idx) => {
                          const fullUrl = imgUrl.startsWith("http")
                            ? imgUrl
                            : `${imgUrl}`;

                          const isCurrent = idx === activeImageIndex;
                          const total = selectedImages.length;
                          const relativeIndex =
                            (idx - activeImageIndex + total) % total;

                          // Yelpaze pozisyonları (PostCard ile birebir aynı mantık)
                          let transformStyle =
                            "translate-x-0 translate-y-0 rotate-0 opacity-100 z-30";

                          if (relativeIndex === 1) {
                            transformStyle =
                              "-translate-x-4 -translate-y-1 -rotate-6 opacity-85 z-20";
                          } else if (relativeIndex === 2) {
                            transformStyle =
                              "-translate-x-8 -translate-y-2 -rotate-12 opacity-70 z-10";
                          }

                          return (
                            <div
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isCurrent && selectedImages.length > 1) {
                                  setActiveImageIndex(
                                    (prev) =>
                                      (prev + 1) % selectedImages.length,
                                  );
                                } else {
                                  setActiveImageIndex(idx);
                                }
                              }}
                              className={`absolute w-full h-full bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 ease-out ${
                                idx === activeImageIndex
                                  ? "cursor-pointer"
                                  : "cursor-default"
                              } ${transformStyle}`}
                            >
                              <img
                                src={fullUrl}
                                alt={`Cover preview ${idx}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white border border-gray-200 rounded-xl text-gray-400 text-xs text-center p-2">
                        Görsel seçilmedi
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-3">
                    Önizlemedeki karta tıklayarak yelpaze akışını test
                    edebilirsiniz.
                  </span>
                </div>

                {/* 2. SEÇİLEBİLİR GÖRSELLER GRID LİSTESİ */}
                <div className="grid grid-cols-5 gap-3">
                  {availableImages.map((img, index) => {
                    const isSelected = selectedImages.includes(img);
                    const selectionIndex = selectedImages.indexOf(img) + 1;
                    const isLimitReached =
                      selectedImages.length >= 3 && !isSelected;

                    return (
                      <div
                        key={index}
                        onClick={() => {
                          if (isLimitReached) return; // Limit dolduysa tıklamayı engelle
                          toggleImageSelection(img);
                        }}
                        className={`relative h-16 rounded-xl overflow-hidden border-2 transition-all ${
                          isSelected
                            ? "border-green-800 shadow-md scale-[1.02] cursor-pointer"
                            : isLimitReached
                              ? "border-gray-200 opacity-30 cursor-not-allowed" // Limit dolunca soluk ve tıklanamaz
                              : "border-gray-200 opacity-60 hover:opacity-100 cursor-pointer"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Content img ${index}`}
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-green-800 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow">
                            {selectionIndex}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="text-xs text-gray-400 leading-relaxed mt-1">
              Seçtiğiniz görseller kart üzerindeki kayan vitrinde bu sırayla
              görüntülenecektir.
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Sahnenin Alt Başlığı
            </label>
            <textarea
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              rows={3}
              className="w-full p-3 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-green-800 resize-none"
              placeholder="Yazınızı kısaca özetleyin..."
            />
          </div>
        </div>

        {/* Sağ Sütun: Etiketler, Subtitle, Süre ve Yayınla */}
        <div className="flex flex-col gap-8">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Etiketler (Max 5)
            </label>
            <div className="p-2 border border-gray-200 rounded-md min-h-[50px] bg-white flex flex-wrap gap-2 items-center">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  onClick={() => removeTag(tag)}
                  className="bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded-sm flex items-center gap-1 cursor-pointer"
                >
                  #{tag}
                  <button className="text-gray-400 hover:text-black ml-1 cursor-pointer">
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
                      ? "Sahne etiketlerinizi girin..."
                      : "Ekleyin..."
                  }
                  className="text-sm outline-none flex-1 min-w-[120px] px-2 py-1 bg-transparent"
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Fuaye / Tartışma Süresi
            </label>
            <div className="grid grid-cols-3 gap-2">
              {durationOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDiscussionDurationHours(opt.value)}
                  className={`text-xs font-medium px-3 py-2 rounded-md transition-all cursor-pointer ${
                    discussionDurationHours === opt.value
                      ? "bg-black text-white border-black shadow-sm"
                      : "bg-white text-gray-700 border border-gray-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Aksiyon Butonları */}
          <div className="flex w-full items-center gap-4 pt-4 border-t border-gray-100">
            <button
              onClick={handlePublish}
              disabled={isSubmitting}
              className="bg-green-800 w-full text-white text-sm px-4 py-2 rounded-md hover:bg-green-700 transition-all font-medium cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Sahneleniyor..." : "Sahnele"}
            </button>
            {/* <button className="text-sm text-green-800 hover:underline cursor-pointer">
              Schedule for later
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
}
