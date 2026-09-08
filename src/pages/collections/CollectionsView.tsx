"use client";

import { useState, useEffect } from "react";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { PostResponse } from "@/services/server/post.service";
import PostCard from "@/components/projects/PostCard";
import { useGetCollectionsPosts } from "@/hooks/posts/useGetCollectionsPosts";
import Image from "next/image";
import { sahnelerim } from "@/utils";
import { FaTicketSimple, FaPlus, FaBookmark, FaFolder } from "react-icons/fa6";
import CreateCollectionModal from "@/components/collections/CreateCollectionModal";
import SaveToCollectionModal from "@/components/collections/SaveToCollectionModal"; // ✨ Yeni eklendi
import {
  getUserCollectionsClient,
  BookmarkCollection,
} from "@/services/client/collection/collection.service";

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
  const [activeTab, setActiveTab] = useState<
    "liked" | "bookmarked" | "collections"
  >("liked");
  const [selectedType, setSelectedType] = useState<string | undefined>(
    undefined,
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // ✨ Hangi postun koleksiyona kaydedileceğini tutan state
  const [savingPostId, setSavingPostId] = useState<number | null>(null);

  // ✨ Kullanıcının özel koleksiyonları listesi
  const [userCollections, setUserCollections] = useState<BookmarkCollection[]>(
    [],
  );
  const [collectionsLoading, setCollectionsLoading] = useState(false);

  const {
    posts,
    isLoadingMore,
    hasMore,
    loadMorePosts,
    currentPage,
    fetchPostsByType,
  } = useGetCollectionsPosts(initialPosts, initialPage, totalPages);

  // Kullanıcı özel koleksiyonlar sekmesine geçerse koleksiyonları çek
  useEffect(() => {
    if (activeTab === "collections") {
      fetchUserCollections();
    }
  }, [activeTab]);

  const fetchUserCollections = async () => {
    setCollectionsLoading(true);
    try {
      const data = await getUserCollectionsClient();
      setUserCollections(data);
    } catch (error) {
      console.error("Koleksiyonlar yüklenemedi:", error);
    } finally {
      setCollectionsLoading(false);
    }
  };

  const handleTabChange = (tab: "liked" | "bookmarked" | "collections") => {
    if (activeTab === tab) return;
    setActiveTab(tab);
    if (tab !== "collections") {
      fetchPostsByType(tab as "liked" | "bookmarked");
    }
  };

  const handleSelectType = (type: string) => {
    setSelectedType(selectedType === type ? undefined : type);
  };

  const loadMoreRef = useInfiniteScroll(
    () => {
      if (activeTab !== "collections") {
        loadMorePosts(activeTab as "liked" | "bookmarked");
      }
    },
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
                Beğendiğin, kaydettiğin sahneler ve özel koleksiyonların
              </p>
            </div>
            <div className="flex items-center gap-2 select-none">
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-800">
                  {activeTab === "collections"
                    ? userCollections.length
                    : posts.length}
                </span>
                <span className="text-xs text-gray-500">
                  {activeTab === "collections"
                    ? "Koleksiyon listeleniyor"
                    : "İçerik listeleniyor"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Yeni Koleksiyon Oluştur Butonu */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
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
            <button
              onClick={() => handleTabChange("collections")}
              className={`pb-3 text-xs font-medium transition-colors relative cursor-pointer ${
                activeTab === "collections"
                  ? "text-black border-b-2 border-black"
                  : "text-gray-500"
              }`}
            >
              Özel Koleksiyonlarım
            </button>
          </div>

          {/* Sağ taraf: İçerik Türü Filtreleri (Yalnızca liked/bookmarked sekmesindeyken görünür) */}
          {activeTab !== "collections" && (
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
                    borderColor:
                      selectedType === "SAHNE" ? "#c86b5a" : undefined,
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
          )}
        </div>

        {/* LİSTELEME ALANI */}
        <div className="pt-2">
          {activeTab === "collections" ? (
            /* Özel Koleksiyonlar Listesi */
            collectionsLoading ? (
              <div className="py-12 text-center text-xs text-gray-400">
                Koleksiyonlar yükleniyor...
              </div>
            ) : userCollections.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {userCollections.map((col) => (
                  <div
                    key={col.id}
                    className="flex flex-col justify-between p-5 rounded-2xl border border-gray-100 hover:border-black transition-all bg-white shadow-xs gap-4 group"
                  >
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <div className="p-2.5 rounded-xl bg-gray-50 text-gray-800 group-hover:bg-black group-hover:text-white transition-colors">
                          <FaFolder className="text-sm" />
                        </div>
                        {col.isDefault && (
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                            Varsayılan
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 mt-1">
                        {col.name}
                      </h3>
                      {col.description && (
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {col.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-gray-500 border border-dashed border-gray-200 rounded-xl">
                Henüz özel bir koleksiyon oluşturmadın.
              </div>
            )
          ) : /* Beğenilenler ve Kaydedilenler Post Listesi */
          posts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {posts.map((post) => (
                <div key={post?.id} className="relative group">
                  <PostCard post={post} />
                  {/* ✨ Post kartı üzerine hızlıca özel koleksiyona kaydetme butonu eklenebilir */}
                  <button
                    onClick={() => setSavingPostId(post.id)}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-xs border border-gray-200 text-gray-700 rounded-xl shadow-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black hover:text-white hover:border-black cursor-pointer"
                    title="Koleksiyona Ekle"
                  >
                    <FaBookmark className="text-xs" />
                  </button>
                </div>
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

        {activeTab !== "collections" && hasMore && (
          <div ref={loadMoreRef}></div>
        )}

        {activeTab !== "collections" && isLoadingMore && (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
            <span className="ml-3 text-gray-600 text-xs">
              İçerikler yükleniyor...
            </span>
          </div>
        )}

        {!hasMore && posts.length > 0 && activeTab !== "collections" && (
          <div className="py-8 text-center text-xs text-gray-500">
            Tüm içerikler yüklendi.
          </div>
        )}
      </div>

      {/* Yeni Koleksiyon Oluşturma Modalı */}
      <CreateCollectionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          if (activeTab === "collections") {
            fetchUserCollections();
          }
        }}
      />

      {/* ✨ Belirli bir postu koleksiyona kaydetme modalı */}
      {savingPostId !== null && (
        <SaveToCollectionModal
          postId={savingPostId}
          isOpen={savingPostId !== null}
          onClose={() => setSavingPostId(null)}
        />
      )}
    </div>
  );
}
