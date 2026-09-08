"use client";

import { useState } from "react";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { PostResponse } from "@/services/server/post.service";
import PostCard from "@/components/projects/PostCard";
import { useGetCollectionsPosts } from "@/hooks/posts/useGetCollectionsPosts";
import Image from "next/image";
import { sahnelerim } from "@/utils";
import { FaTicketSimple, FaPlus } from "react-icons/fa6";
import CreateCollectionModal from "@/components/collections/CreateCollectionModal";

interface CollectionsViewProps {
  initialPosts: PostResponse[];
  initialPage: number;
  totalPages: number;
}

export default function CollectionsView({
  initialPosts,
  initialPage,
  totalPages,
}: CollectionsViewProps) {
  const [activeTab, setActiveTab] = useState<"liked" | "bookmarked">("liked");
  const [selectedType, setSelectedType] = useState<string | undefined>(
    undefined,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    posts,
    isLoadingMore,
    hasMore,
    loadMorePosts,
    currentPage,
    fetchPostsByType,
  } = useGetCollectionsPosts(initialPosts, initialPage, totalPages);

  const handleTabChange = (tab: "liked" | "bookmarked") => {
    if (activeTab === tab) return;
    setActiveTab(tab);
    fetchPostsByType(tab);
  };

  const handleSelectType = (type: string) => {
    setSelectedType(selectedType === type ? undefined : type);
  };

  const loadMoreRef = useInfiniteScroll(
    () => loadMorePosts(activeTab),
    hasMore,
    isLoadingMore,
  );

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* ÜST BAŞLIK ALANI */}
      <div className="flex items-end justify-between gap-4">
        <div className="flex items-end gap-4">
          <div className="relative">
            <Image
              src={sahnelerim}
              alt="Koleksiyonlar"
              className="w-34 h-28 object-cover"
            />
          </div>
          <div className="flex flex-col gap-4">
            <div
              className="flex flex-col gap-2 border-b border-gray-200"
              style={{ paddingBottom: "8px" }}
            >
              <h1 className="text-3xl font-semibold tracking-tight merriweather-sans text-gray-900">
                Koleksiyonlar
              </h1>
              <p className="text-xs text-gray-500">
                Beğendiğin ve sonradan incelemek üzere kaydettiğin sahneler
              </p>
            </div>
            <div className="flex items-center gap-2 select-none">
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-800">{posts.length}</span>
                <span className="text-xs text-gray-500">
                  İçerik listeleniyor
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Yeni Koleksiyon Oluştur Butonu */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-black text-white rounded-xl hover:bg-gray-800 cursor-pointer transition-colors shadow-xs"
        >
          <FaPlus className="text-[10px]" />
          <span>Yeni Koleksiyon</span>
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {/* Üst Sekmeler ve Tür Filtreleri */}
        <div
          className="w-full relative flex items-end justify-between border-b border-gray-100 bg-white"
          style={{ height: "48px" }}
        >
          {/* Sol taraf: Sekmeler */}
          <div className="flex space-x-6">
            <button
              onClick={() => handleTabChange("liked")}
              className={`pb-3 text-xs font-medium transition-colors relative cursor-pointer ${
                activeTab === "liked"
                  ? "text-black border-b-2 border-black"
                  : "text-gray-500"
              }`}
            >
              Beğenilenler
            </button>
            <button
              onClick={() => handleTabChange("bookmarked")}
              className={`pb-3 text-xs font-medium transition-colors relative cursor-pointer ${
                activeTab === "bookmarked"
                  ? "text-black border-b-2 border-black"
                  : "text-gray-500"
              }`}
            >
              Kaydedilenler
            </button>
          </div>

          {/* Sağ taraf: İçerik Türü Filtreleri */}
          <div className="relative h-12 flex items-end justify-end">
            <ul className="relative z-50 flex items-end justify-end gap-5 overflow-x-auto scrollbar-hide">
              <button
                type="button"
                className={`pb-3 flex items-center gap-1.5 cursor-pointer transition-all ${
                  selectedType === undefined
                    ? "border-b-2 border-black font-medium"
                    : "text-gray-400 hover:text-gray-700"
                }`}
                onClick={() => setSelectedType(undefined)}
              >
                <span className="text-xs">Tümü</span>
              </button>

              <button
                type="button"
                className={`pb-3 flex items-center gap-1.5 cursor-pointer transition-all ${
                  selectedType === "SAHNE"
                    ? "border-b-2 font-medium"
                    : "text-gray-400 hover:text-gray-700"
                }`}
                style={{
                  borderColor: selectedType === "SAHNE" ? "#c86b5a" : undefined,
                }}
                onClick={() => handleSelectType("SAHNE")}
              >
                <FaTicketSimple
                  className="text-base"
                  style={{ color: "#c86b5a" }}
                />
                <span className="text-xs">Sahne</span>
              </button>

              <button
                type="button"
                className={`pb-3 flex items-center gap-1.5 cursor-pointer transition-all ${
                  selectedType === "MONOLOG"
                    ? "border-b-2 font-medium"
                    : "text-gray-400 hover:text-gray-700"
                }`}
                style={{
                  borderColor:
                    selectedType === "MONOLOG" ? "#66788a" : undefined,
                }}
                onClick={() => handleSelectType("MONOLOG")}
              >
                <FaTicketSimple
                  className="text-base"
                  style={{ color: "#66788a" }}
                />
                <span className="text-xs">Monolog</span>
              </button>

              <button
                type="button"
                className={`pb-3 flex items-center gap-1.5 cursor-pointer transition-all ${
                  selectedType === "YANYANA"
                    ? "border-b-2 font-medium"
                    : "text-gray-400 hover:text-gray-700"
                }`}
                style={{
                  borderColor:
                    selectedType === "YANYANA" ? "#789680" : undefined,
                }}
                onClick={() => handleSelectType("YANYANA")}
              >
                <FaTicketSimple
                  className="text-base"
                  style={{ color: "#789680" }}
                />
                <span className="text-xs">Yan Yana</span>
              </button>

              <button
                type="button"
                className={`pb-3 flex items-center gap-1.5 cursor-pointer transition-all ${
                  selectedType === "TERSYUZ"
                    ? "border-b-2 font-medium"
                    : "text-gray-400 hover:text-gray-700"
                }`}
                style={{
                  borderColor:
                    selectedType === "TERSYUZ" ? "#f4d45f" : undefined,
                }}
                onClick={() => handleSelectType("TERSYUZ")}
              >
                <FaTicketSimple
                  className="text-base"
                  style={{ color: "#f4d45f" }}
                />
                <span className="text-xs">Tersyüz</span>
              </button>
            </ul>
          </div>
        </div>

        {/* PROJE / İÇERİK LİSTESİ */}
        <div className="pt-2">
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {posts.map((post) => (
                <PostCard key={post?.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-gray-500 border border-dashed border-gray-200 rounded-xl">
              {activeTab === "liked"
                ? "Henüz beğendiğin bir içerik bulunmuyor."
                : "Henüz kaydettiğin bir içerik bulunmuyor."}
            </div>
          )}
        </div>

        {hasMore && <div ref={loadMoreRef}></div>}

        {isLoadingMore && (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
            <span className="ml-3 text-gray-600 text-xs">
              İçerikler yükleniyor...
            </span>
          </div>
        )}

        {!hasMore && posts.length > 0 && (
          <div className="py-8 text-center text-xs text-gray-500">
            Tüm içerikler yüklendi.
          </div>
        )}

        {totalPages > 1 && (
          <div className="py-4 text-center text-sm text-gray-400">
            Sayfa {currentPage + 1} / {totalPages} • {posts.length} içerik
          </div>
        )}
      </div>

      {/* Koleksiyon Oluşturma Modalı */}
      <CreateCollectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          // Başarılı olduğunda listeyi güncelleyebilir veya toast çıkarabilirsin
          console.log("Koleksiyon başarıyla oluşturuldu.");
        }}
      />
    </div>
  );
}
