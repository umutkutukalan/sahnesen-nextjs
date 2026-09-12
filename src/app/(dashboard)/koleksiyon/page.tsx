"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { collectiondefault, koleksiyonlar, sagperde, solperde } from "@/utils";
import { FaPlus } from "react-icons/fa6";
import CreateCollectionModal from "@/components/collections/CreateCollectionModal";
import {
  getUserCollectionsClient,
  BookmarkCollection,
  deleteCollectionClient,
} from "@/services/client/collection/collection.service";
import { getFullImageUrl } from "@/utils/image";
import { TbRosetteDiscountCheckFilled } from "react-icons/tb";
import { useAuth } from "@/context/UserContext";
import { FiMoreHorizontal, FiUser } from "react-icons/fi";
import { useToProfile } from "@/utils/useToProfile";
import { useRouter } from "next/navigation";

export default function CollectionsPage() {
  const { user } = useAuth();
  const { ToProfile } = useToProfile();
  const router = useRouter();

  const [userCollections, setUserCollections] = useState<BookmarkCollection[]>(
    [],
  );
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] =
    useState<BookmarkCollection | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchUserCollections();
    }
  }, [user]);

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

  const handleSelectCollection = (collection: BookmarkCollection) => {
    router.push(`/koleksiyon/${collection.id}`);
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

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* LİSTE */}
      <div className="pt-2">
        {collectionsLoading ? (
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
                              src={content?.coverImage || "/placeholder.png"}
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
                              boxShadow: "0px 0px 5px 1px rgba(0, 0, 0, 0.1)",
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
          <p className="text-gray-500 text-xs">
            Henüz koleksiyonun bulunmuyor.
          </p>
        )}
      </div>

      <CreateCollectionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchUserCollections}
      />
    </div>
  );
}
