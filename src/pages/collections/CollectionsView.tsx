"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { PostResponse } from "@/services/server/post.service";
import PostCard from "@/components/projects/PostCard";
import { useGetCollectionsPosts } from "@/hooks/posts/useGetCollectionsPosts";
import Image from "next/image";
import { collectiondefault, koleksiyonlar, sagperde, solperde } from "@/utils";
import { FaTicketSimple, FaPlus, FaArrowLeft } from "react-icons/fa6";
import CreateCollectionModal from "@/components/collections/CreateCollectionModal";
import SaveToCollectionModal from "@/components/collections/SaveToCollectionModal";
import {
  getUserCollectionsClient,
  getCollectionPostsClient,
  BookmarkCollection,
  deleteCollectionClient,
} from "@/services/client/collection/collection.service";
import { getFullImageUrl } from "@/utils/image";
import { TbRosetteDiscountCheckFilled } from "react-icons/tb";
import { useAuth } from "@/context/UserContext";
import { FiMoreHorizontal, FiUser } from "react-icons/fi";
import { useToProfile } from "@/utils/useToProfile";

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
  const { user } = useAuth();
  const { ToProfile } = useToProfile();
  const [activeTab, setActiveTab] = useState<"liked" | "bookmarked">("liked");
  const [selectedType, setSelectedType] = useState<string | undefined>(
    undefined,
  );
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [editingCollection, setEditingCollection] =
    useState<BookmarkCollection | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [savingPostId, setSavingPostId] = useState<number | null>(null);

  // Kaydedilenler sekmesindeyken seçilen özel koleksiyon
  const [selectedCollection, setSelectedCollection] =
    useState<BookmarkCollection | null>(null);
  const [collectionPosts, setCollectionPosts] = useState<PostResponse[]>([]);
  const [collectionPostsLoading, setCollectionPostsLoading] = useState(false);

  // Koleksiyon içi sayfalama state'leri
  const [collectionPage, setCollectionPage] = useState(0);
  const [hasMoreCollectionPosts, setHasMoreCollectionPosts] = useState(true);
  const [isCollectionLoadingMore, setIsCollectionLoadingMore] = useState(false);

  // Kullanıcının özel koleksiyonları
  const [userCollections, setUserCollections] = useState<BookmarkCollection[]>(
    [],
  );
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<Set<number>>(
    new Set(),
  );

  const { posts, isLoadingMore, hasMore, loadMorePosts, fetchPostsByType } =
    useGetCollectionsPosts(initialPosts, initialPage, totalPages);

  // Dışarı tıklandığında üç nokta menüsünü kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };

    if (activeMenuId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeMenuId]);

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

  // Koleksiyon içeriklerini sayfalı ve filtreli çekme
  const fetchCollectionPosts = useCallback(
    async (
      collectionId: number,
      postType?: string,
      page = 0,
      append = false,
    ) => {
      if (append) {
        setIsCollectionLoadingMore(true);
      } else {
        setCollectionPostsLoading(true);
      }
      try {
        const data = await getCollectionPostsClient(
          collectionId,
          page,
          10,
          postType,
        );
        setCollectionPosts((prev) =>
          append ? [...prev, ...(data.content || [])] : data.content || [],
        );
        setHasMoreCollectionPosts(!data.last);
        setCollectionPage(page);
      } catch (error) {
        console.error("Koleksiyon içerikleri yüklenemedi:", error);
      } finally {
        setCollectionPostsLoading(false);
        setIsCollectionLoadingMore(false);
      }
    },
    [],
  );

  // Koleksiyon seçildiğinde veya tür filtresi değiştiğinde sıfırdan yükle
  useEffect(() => {
    if (selectedCollection) {
      fetchCollectionPosts(selectedCollection.id, selectedType, 0, false);
    }
  }, [selectedCollection, selectedType, fetchCollectionPosts]);

  const handleSelectCollection = (collection: BookmarkCollection) => {
    setSelectedCollection(collection);
    setSelectedType(undefined);
  };

  const handleDeleteCollection = async (collectionId: number) => {
    if (!confirm("Bu koleksiyonu silmek istediğinize emin misiniz?")) return;
    try {
      await deleteCollectionClient(collectionId);
      setUserCollections((prev) =>
        prev.filter((col) => col.id !== collectionId),
      );
    } catch (error) {
      console.error("Koleksiyon silinemedi:", error);
    }
  };

  const handleTabChange = (tab: "liked" | "bookmarked") => {
    if (activeTab === tab && !selectedCollection) return;
    setActiveTab(tab);
    setSelectedCollection(null);
    setSelectedType(undefined);
    if (tab === "liked") {
      fetchPostsByType("liked", undefined);
    }
  };

  const handleSelectType = (type: string | undefined) => {
    const newType = selectedType === type ? undefined : type;
    setSelectedType(newType);

    if (activeTab === "liked") {
      fetchPostsByType("liked", newType);
    }
  };

  // Sonsuz kaydırma hook'u (Hem beğenilenler hem koleksiyon içi detay için)
  const loadMoreRef = useInfiniteScroll(
    () => {
      if (activeTab === "liked") {
        loadMorePosts("liked");
      } else if (activeTab === "bookmarked" && selectedCollection) {
        if (!isCollectionLoadingMore && hasMoreCollectionPosts) {
          fetchCollectionPosts(
            selectedCollection.id,
            selectedType,
            collectionPage + 1,
            true,
          );
        }
      }
    },
    selectedCollection ? hasMoreCollectionPosts : hasMore,
    selectedCollection ? isCollectionLoadingMore : isLoadingMore,
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
              className="w-32 h-32 object-cover"
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
                    onClick={() => {
                      setSelectedCollection(null);
                      setSelectedType(undefined);
                    }}
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
                    "Bu koleksiyona kaydettiğin sahneler"
                  : "Beğendiğin ve kaydettiğin özel koleksiyonlar"}
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

        {/* Yeni Koleksiyon Oluştur Butonu */}
        {activeTab === "bookmarked" && !selectedCollection && (
          <button
            onClick={() => {
              setEditingCollection(null);
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-black text-white rounded-sm hover:bg-gray-800 cursor-pointer transition-colors shadow-xs"
          >
            <FaPlus className="text-[10px]" />
            <span>Koleksiyon</span>
          </button>
        )}
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
              Koleksiyonlar
            </button>
          </div>

          {/* Sağ taraf: İçerik Türü Filtreleri */}
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
                  onClick={() => handleSelectType(undefined)}
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
            collectionsLoading ? (
              <div className="py-12 text-center text-xs text-gray-400">
                Koleksiyonlar yükleniyor...
              </div>
            ) : userCollections.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userCollections.map((col) => {
                  const previewContents = col.contents?.slice(0, 4) || [];
                  const count = previewContents.length;

                  return (
                    <div
                      key={col.id}
                      onClick={() => handleSelectCollection(col)}
                      className="relative flex items-end rounded-lg border border-gray-100 shadow-xs gap-3 group cursor-pointer overflow-hidden"
                    >
                      <div className="absolute right-0 top-0 z-10">
                        <Image
                          src={sagperde}
                          alt="sağ perde"
                          className="w-20 object-cover"
                        />
                      </div>
                      <div
                        className="h-full w-34 shrink-0 overflow-hidden bg-white flex items-center justify-center"
                        style={{
                          display: count > 0 ? "grid" : "flex",
                          gridTemplateColumns:
                            count === 1 ? "1fr" : "repeat(2, minmax(0, 1fr))",
                          gridTemplateRows:
                            count <= 2 ? "1fr" : "repeat(2, minmax(0, 1fr))",
                          gap: "2px",
                        }}
                      >
                        {count > 0 ? (
                          previewContents.map((content, index) => {
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
                          <div className="w-full h-full flex items-center justify-center bg-white">
                            <Image
                              src={collectiondefault}
                              alt="Collection Default"
                              unoptimized
                              className="object-cover w-20 h-20"
                            />
                          </div>
                        )}
                      </div>

                      <div className="h-full flex flex-col justify-between gap-2 min-w-0 flex-1 py-3">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            ToProfile(user?.username || "");
                          }}
                          className="flex items-center gap-2 cursor-pointer w-max"
                        >
                          <div className="relative w-5 h-5 rounded-full overflow-hidden border border-gray-200">
                            {user?.profileImg ? (
                              <Image
                                src={getFullImageUrl(user?.profileImg)!}
                                alt="avatar"
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            ) : (
                              <FiUser className="w-full h-full p-1 text-gray-400" />
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <span className="truncate hover:underline">
                              {user?.username || "Yazar"}
                            </span>
                            <TbRosetteDiscountCheckFilled
                              className="text-blue-500 shrink-0 text-xs"
                              title="Onaylı Yazar"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <h3 className="text-xl font-extrabold tracking-tight merriweather-sans">
                            {col.name}
                          </h3>
                          {col.isDefault && (
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium shrink-0">
                              Varsayılan
                            </span>
                          )}
                          {col.description && (
                            <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">
                              {col.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between relative">
                          <div className="relative flex items-center">
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

                          {/* Üç Nokta Butonu ve Açılır Menü */}
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(
                                  activeMenuId === col.id ? null : col.id,
                                );
                              }}
                              className="py-1 px-2 text-gray-400 hover:text-black transition-colors cursor-pointer"
                              title="Seçenekler"
                            >
                              <FiMoreHorizontal className="text-lg" />
                            </button>

                            {activeMenuId === col.id && (
                              <div
                                ref={menuRef}
                                className="absolute right-0 bottom-full w-48 flex flex-col bg-white rounded-sm z-50 px-4 py-3 gap-2"
                                style={{
                                  boxShadow:
                                    "0px 0px 5px 1px rgba(0, 0, 0, 0.1)",
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    setEditingCollection(col);
                                    setIsEditModalOpen(true);
                                  }}
                                  className="flex items-center text-xs text-gray-600 hover:text-black transition text-left cursor-pointer"
                                >
                                  Koleksiyonu Düzenle
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    handleDeleteCollection(col.id);
                                  }}
                                  className="flex items-center text-xs transition text-left cursor-pointer"
                                  style={{
                                    color: "#b94445",
                                  }}
                                >
                                  Koleksiyonu Sil
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="">
                <p className="text-gray-500 text-xs">
                  Henüz beğendiğin bir sahne bulunmuyor.
                </p>
              </div>
            )
          ) : selectedCollection ? (
            collectionPostsLoading ? (
              <div className="py-12 text-center text-xs text-gray-400">
                İçerikler yükleniyor...
              </div>
            ) : collectionPosts.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {collectionPosts.map((post) => (
                  <PostCard key={post?.id} post={post} />
                ))}
                <div ref={loadMoreRef} className="h-4 w-full" />
                {isCollectionLoadingMore && (
                  <div className="py-4 text-center text-xs text-gray-400">
                    Daha fazla yükleniyor...
                  </div>
                )}
              </div>
            ) : (
              <div className="">
                <p className="text-gray-500 text-xs">
                  {selectedType
                    ? `Bu koleksiyonda '${selectedType}' türünde sahne bulunmuyor.`
                    : "Bu koleksiyonda henüz hiç sahne bulunmuyor."}
                </p>
              </div>
            )
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {posts.map((post) => {
                return (
                  <div key={post?.id} className="relative group">
                    <PostCard post={post} />
                  </div>
                );
              })}
              <div ref={loadMoreRef} className="h-4 w-full" />
              {isLoadingMore && (
                <div className="py-4 text-center text-xs text-gray-400">
                  Daha fazla yükleniyor...
                </div>
              )}
            </div>
          ) : (
            <div className="">
              <p className="text-gray-500 text-xs">
                Henüz beğendiğin bir sahne bulunmuyor.
              </p>
            </div>
          )}
        </div>
      </div>

      <CreateCollectionModal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          setEditingCollection(null);
        }}
        onSuccess={() => {
          if (activeTab === "bookmarked" && !selectedCollection) {
            fetchUserCollections();
          }
        }}
        editingCollection={editingCollection}
      />

      {savingPostId !== null && (
        <SaveToCollectionModal
          postId={savingPostId}
          isOpen={savingPostId !== null}
          onClose={() => setSavingPostId(null)}
          onSaved={() => {
            setBookmarkedPostIds((prev) => new Set(prev).add(savingPostId));
          }}
        />
      )}
    </div>
  );
}
