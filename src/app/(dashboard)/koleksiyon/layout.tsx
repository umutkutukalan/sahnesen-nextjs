"use client";

import Image from "next/image";
import { koleksiyonlar } from "@/utils";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { FaArrowLeft, FaTicketSimple, FaPlus } from "react-icons/fa6";
import { useEffect, useState } from "react";
import CreateCollectionModal from "@/components/collections/CreateCollectionModal";
import {
  BookmarkCollection,
  getUserCollectionsClient,
} from "@/services/client/collection/collection.service";

export default function KoleksiyonlarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();

  const selectedType = searchParams?.get("type") || undefined;

  const collectionId = Number(params?.collectionId);

  const isLikedTab = pathname?.includes("/begenilenler");
  const isDetailView =
    !isNaN(collectionId) &&
    pathname?.includes(`/koleksiyon/${collectionId}`) &&
    !isLikedTab;

  // Modal ve düzenleme state'leri
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [userCollections, setUserCollections] = useState<BookmarkCollection[]>(
    [],
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [collectionsLoading, setCollectionsLoading] = useState(true);

  const handleSelectType = (type: string | undefined) => {
    const params = new URLSearchParams(searchParams?.toString());
    if (type) {
      params.set("type", type);
    } else {
      params.delete("type");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

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

  useEffect(() => {
    fetchUserCollections();
  }, []);

  const currentCollection = userCollections.find(
    (col) => col.id === collectionId,
  );

  const types = [
    { name: "Tümü", value: undefined, color: undefined },
    { name: "Sahne", value: "SAHNE", color: "#f18fa0" },
    { name: "Monolog", value: "MONOLOG", color: "#9dce9d" },
    { name: "Yan Yana", value: "YANYANA", color: "#91c5e5" },
    { name: "Tersyüz", value: "TERSYUZ", color: "#f5d35e" },
  ];

  return (
    <div className="min-h-screen text-black py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col gap-5">
      <div className="flex flex-col gap-5 w-full">
        {/* ÜST BAŞLIK VE KAPAK GÖRSELİ */}
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
                {isDetailView ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push("/koleksiyon")}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer text-gray-600"
                      title="Geri Dön"
                    >
                      <FaArrowLeft className="text-xs" />
                    </button>
                    <h1 className="text-2xl font-semibold tracking-tight merriweather-sans text-gray-900 truncate max-w-md">
                      {currentCollection
                        ? currentCollection.name
                        : "Koleksiyon Detayı"}
                    </h1>
                  </div>
                ) : (
                  <h1 className="text-3xl font-semibold tracking-tight merriweather-sans text-gray-900">
                    {isLikedTab ? "Beğenilenler" : "Koleksiyonlar"}
                  </h1>
                )}
                <p className="text-xs text-gray-500">
                  {isDetailView
                    ? currentCollection?.description ||
                      "Bu koleksiyona kaydettiğin sahneler"
                    : isLikedTab
                      ? "Beğendiğin sahneler"
                      : "Koleksiyonlarına kaydettiğin sahneler"}
                </p>
              </div>
              <div className="flex items-center gap-2 select-none">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-800">0</span>
                  <span className="text-xs text-gray-500">
                    {isLikedTab
                      ? "Sahne listeleniyor"
                      : "Koleksiyon listeleniyor"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* İstediğin Buton Yapısı (Beğenilenler sekmesinde veya detayda değilken görünür) */}
          {!isLikedTab && !isDetailView && (
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
          {/* SEKMELER VE SAĞDA TÜR FİLTRELERİ */}
          <div
            className="w-full relative flex items-end justify-between border-b border-gray-100 bg-white"
            style={{ height: "48px" }}
          >
            {/* Sol taraf: Sekmeler */}
            <div className="flex space-x-6">
              <button
                onClick={() => router.push("/koleksiyon")}
                className={`pb-3 text-xs font-medium transition-colors relative cursor-pointer ${
                  !isLikedTab && !isDetailView
                    ? "text-black border-b-2 border-black"
                    : "text-gray-500"
                }`}
              >
                Koleksiyonlar
              </button>
              <button
                onClick={() => router.push("/koleksiyon/begenilenler")}
                className={`pb-3 text-xs font-medium transition-colors relative cursor-pointer ${
                  isLikedTab
                    ? "text-black border-b-2 border-black"
                    : "text-gray-500"
                }`}
              >
                Beğenilenler
              </button>
            </div>

            {/* Sağ taraf: Tür Filtreleri */}
            {(isLikedTab || isDetailView) && (
              <div className="relative h-12 flex items-end justify-end">
                <ul className="relative z-50 flex items-end justify-end gap-5 overflow-x-auto scrollbar-hide">
                  {types.map((t) => {
                    const isSelected = selectedType === t.value;
                    return (
                      <button
                        key={t.name}
                        type="button"
                        className={`pb-3 flex items-center gap-1.5 cursor-pointer transition-all ${
                          isSelected
                            ? "font-medium border-b-2"
                            : "text-gray-400 hover:text-gray-700"
                        }`}
                        style={{
                          borderColor: isSelected
                            ? t.color || "#000"
                            : undefined,
                        }}
                        onClick={() => handleSelectType(t.value)}
                      >
                        {t.value && (
                          <FaTicketSimple
                            className="text-base"
                            style={{ color: t.color }}
                          />
                        )}
                        <span className="text-xs">{t.name}</span>
                      </button>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* ALT İÇERİK */}
          <div className="">{children}</div>
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
          fetchUserCollections();
        }}
        editingCollection={editingCollection}
      />
    </div>
  );
}
