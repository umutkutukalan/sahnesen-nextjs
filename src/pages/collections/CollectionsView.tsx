"use client";

import { useState, useEffect } from "react";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { PostResponse } from "@/services/server/post.service";
import PostCard from "@/components/projects/PostCard";
import { useGetCollectionsPosts } from "@/hooks/posts/useGetCollectionsPosts";
import Image from "next/image";
import { koleksiyonlar, sahnelerim, solperde } from "@/utils";
import {
  FaTicketSimple,
  FaPlus,
  FaBookmark,
  FaFolder,
  FaArrowLeft,
} from "react-icons/fa6";
import CreateCollectionModal from "@/components/collections/CreateCollectionModal";
import SaveToCollectionModal from "@/components/collections/SaveToCollectionModal";
import {
  getUserCollectionsClient,
  getCollectionPostsClient,
  BookmarkCollection,
  PostPreviewDTO,
} from "@/services/client/collection/collection.service";
import { BsCollection } from "react-icons/bs";
import { getFullImageUrl } from "@/utils/image";

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
  // ✨ Ana sekmeler sadece Beğenilenler ve Kaydedilenler
  const [activeTab, setActiveTab] = useState<"liked" | "bookmarked">("liked");
  const [selectedType, setSelectedType] = useState<string | undefined>(
    undefined,
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [savingPostId, setSavingPostId] = useState<number | null>(null);

  // ✨ Kaydedilenler sekmesindeyken seçilen özel koleksiyon (Null ise koleksiyon kartları listelenir)
  const [selectedCollection, setSelectedCollection] =
    useState<BookmarkCollection | null>(null);
  const [collectionPosts, setCollectionPosts] = useState<PostResponse[]>([]);
  const [collectionPostsLoading, setCollectionPostsLoading] = useState(false);

  // ✨ Kullanıcının özel koleksiyonları
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

  // Kaydedilenler sekmesindeyken ve bir koleksiyona girilmemişse koleksiyonları çek
  useEffect(() => {
    if (activeTab === "bookmarked" && !selectedCollection) {
      fetchUserCollections();
    }
  }, [activeTab, selectedCollection]);

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

  // Bir koleksiyona tıklandığında içeriklerini çek
  const handleSelectCollection = async (collection: BookmarkCollection) => {
    setSelectedCollection(collection);
    setCollectionPostsLoading(true);
    try {
      const data = await getCollectionPostsClient(collection.id);
      setCollectionPosts(data.content || []);
    } catch (error) {
      console.error("Koleksiyon içerikleri yüklenemedi:", error);
    } finally {
      setCollectionPostsLoading(false);
    }
  };

  const handleTabChange = (tab: "liked" | "bookmarked") => {
    if (activeTab === tab && !selectedCollection) return;
    setActiveTab(tab);
    setSelectedCollection(null); // Sekme değişince koleksiyon detayından çık
    setSelectedType(undefined); // Filtreyi sıfırla
    if (tab === "liked") {
      fetchPostsByType("liked");
    }
  };

  const handleSelectType = (type: string) => {
    setSelectedType(selectedType === type ? undefined : type);
  };

  const loadMoreRef = useInfiniteScroll(
    () => {
      if (
        activeTab === "liked" ||
        (activeTab === "bookmarked" && selectedCollection)
      ) {
        loadMorePosts(activeTab);
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
              src={koleksiyonlar}
              alt="Koleksiyonlar"
              className="w-34 h-28 object-cover"
            />
          </div>
          <div className="flex flex-col gap-4">
            <div
              className="flex flex-col gap-2 border-b border-gray-200"
              style={{ paddingBottom: "8px" }}
            >
              {selectedCollection ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedCollection(null)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer text-gray-600"
                    title="Geri Dön"
                  >
                    <FaArrowLeft className="text-xs" />
                  </button>
                  <h1 className="text-2xl font-semibold tracking-tight merriweather-sans text-gray-900">
                    {selectedCollection.name}
                  </h1>
                </div>
              ) : (
                <h1 className="text-3xl font-semibold tracking-tight merriweather-sans text-gray-900">
                  Koleksiyonlar
                </h1>
              )}
              <p className="text-xs text-gray-500">
                {selectedCollection
                  ? selectedCollection.description ||
                    "Bu koleksiyondaki kaydedilen içerikler"
                  : "Beğendiğin ve kaydettiğin özel koleksiyonların"}
              </p>
            </div>
            <div className="flex items-center gap-2 select-none">
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-800">
                  {selectedCollection
                    ? collectionPosts.length
                    : activeTab === "bookmarked" && !selectedCollection
                      ? userCollections.length
                      : posts.length}
                </span>
                <span className="text-xs text-gray-500">
                  {activeTab === "bookmarked" && !selectedCollection
                    ? "Koleksiyon listeleniyor"
                    : "Sahne listeleniyor"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Yeni Koleksiyon Oluştur Butonu (Sadece Kaydedilenler sekmesinde/koleksiyon görünümündeyken gösterilebilir) */}
        {activeTab === "bookmarked" && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-black text-white rounded-xl hover:bg-gray-800 cursor-pointer transition-colors shadow-xs"
          >
            <FaPlus className="text-[10px]" />
            <span>Yeni Koleksiyon</span>
          </button>
        )}
      </div>

      <div className="flex flex-col gap-6">
        {/* Üst Sekmeler ve Tür Filtreleri */}
        <div
          className="w-full relative flex items-end justify-between border-b border-gray-100 bg-white"
          style={{ height: "48px" }}
        >
          {/* Sol taraf: Sekmeler (Beğenilenler / Kaydedilenler) */}
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
              Koleksiyonlar
            </button>
          </div>

          {/* Sağ taraf: İçerik Türü Filtreleri (Beğenilenler sekmesinde VEYA bir koleksiyonun içine girilmişse görünür) */}
          {(activeTab === "liked" || selectedCollection) && (
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
          {activeTab === "bookmarked" && !selectedCollection ? (
            /* Kaydedilenler sekmesindeyken gösterilecek Özel Koleksiyonlar Listesi */
            collectionsLoading ? (
              <div className="py-12 text-center text-xs text-gray-400">
                Koleksiyonlar yükleniyor...
              </div>
            ) : userCollections.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userCollections.map((col) => {
                  const previewContents = col.contents?.slice(0, 4) || [];

                  const count = previewContents.length;
                  // İçerik sayısına göre dinamik grid sınıfları
                  let gridClasses = "grid-cols-1 grid-rows-1"; // 1 tane ise (full)
                  if (count === 2) {
                    gridClasses = "grid-cols-2 grid-rows-1"; // Yan yana 2
                  } else if (count === 3) {
                    gridClasses = "grid-cols-2 grid-rows-2"; // 3 tanede üstte 2, altta 1 yerleşim için
                  } else if (count >= 4) {
                    gridClasses = "grid-cols-2 grid-rows-2"; // 2x2 tam kare
                  }

                  return (
                    <div
                      key={col.id}
                      onClick={() => handleSelectCollection(col)}
                      className="flex items-end rounded-lg border border-gray-100 shadow-xs gap-3 group cursor-pointer overflow-hidden"
                    >
                      {/* Sol Taraf: 2x2 Kare Önizleme Alanı */}
                      <div
                        className="shrink-0 overflow-hidden"
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            count === 1 ? "1fr" : "repeat(2, minmax(0, 1fr))",
                          gridTemplateRows:
                            count <= 2 ? "1fr" : "repeat(2, minmax(0, 1fr))",
                          width: "136px",
                          height: "136px",
                          gap: "2px",
                        }}
                      >
                        {count > 0 ? (
                          previewContents.map((content, index) => {
                            // Eğer 3 içerik varsa ve bu 3. elemense altta tüm alanı kaplasın (col-span-2)
                            const isSpecialSpan = count === 3 && index === 2;

                            return (
                              <div
                                key={index}
                                className={`relative w-full h-full bg-gray-200 overflow-hidden ${
                                  isSpecialSpan ? "col-span-2" : ""
                                }`}
                              >
                                <Image
                                  src={
                                    content?.coverImage || "/placeholder.png"
                                  }
                                  alt={content?.title || "Koleksiyon Görseli"}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            );
                          })
                        ) : (
                          <div className="flex items-center justify-center text-gray-400 text-xs w-full h-full">
                            Boş
                          </div>
                        )}
                      </div>

                      {/* Sağ Taraf: Koleksiyon Bilgileri */}
                      <div className="flex flex-col gap-2 min-w-0 flex-1 pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <h3 className="text-lg font-semibold tracking-tight merriweather-sans">
                              {col.name}
                            </h3>
                            {col.isDefault && (
                              <span className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium shrink-0">
                                Varsayılan
                              </span>
                            )}
                            {col.description && (
                              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                {col.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="relative">
                          <div
                            className="absolute left-0 top-0 w-4 h-4 bg-green-600"
                            style={{
                              maskImage: `url(${solperde.src})`,
                              WebkitMaskImage: `url(${solperde.src})`,
                              maskSize: "contain",
                              WebkitMaskSize: "contain",
                              maskRepeat: "no-repeat",
                              WebkitMaskRepeat: "no-repeat",
                              maskPosition: "center",
                              WebkitMaskPosition: "center",
                            }}
                          />
                          <div
                            className="flex items-center gap-1"
                            style={{ paddingLeft: "10px" }}
                          >
                            <span className="text-[10px] text-gray-800">
                              {col.contents?.length || 0}
                            </span>
                            <span className="text-[10px] text-gray-500">
                              Sahne
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-gray-500 border border-dashed border-gray-200 rounded-xl">
                Henüz özel bir koleksiyon oluşturmadın.
              </div>
            )
          ) : selectedCollection ? (
            /* Seçilen bir koleksiyonun içerisindeki post listesi */
            collectionPostsLoading ? (
              <div className="py-12 text-center text-xs text-gray-400">
                İçerikler yükleniyor...
              </div>
            ) : collectionPosts.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {collectionPosts.map((post) => (
                  <PostCard key={post?.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-gray-500 border border-dashed border-gray-200 rounded-xl">
                Bu koleksiyonda henüz hiç içerik bulunmuyor.
              </div>
            )
          ) : /* Beğenilenler Post Listesi */
          posts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {posts.map((post) => (
                <div key={post?.id} className="relative group">
                  <PostCard post={post} />
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
              Henüz beğendiğin bir içerik bulunmuyor.
            </div>
          )}
        </div>
      </div>

      <CreateCollectionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          if (activeTab === "bookmarked" && !selectedCollection) {
            fetchUserCollections();
          }
        }}
      />

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
