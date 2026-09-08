"use client";

import { useEffect, useState } from "react";
import {
  getUserCollectionsClient,
  addPostToCollectionClient,
  BookmarkCollection,
} from "@/services/client/collection/collection.service";
import { FaTimes } from "react-icons/fa";

interface SaveToCollectionModalProps {
  postId: number;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export default function SaveToCollectionModal({
  postId,
  isOpen,
  onClose,
  onSaved,
}: SaveToCollectionModalProps) {
  const [collections, setCollections] = useState<BookmarkCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCollections();
    }
  }, [isOpen]);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const data = await getUserCollectionsClient();
      setCollections(data);
    } catch (error) {
      console.error("Koleksiyonlar yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToCollection = async (collectionId: number) => {
    setAddingId(collectionId);
    try {
      await addPostToCollectionClient(collectionId, postId);
      onSaved?.();
      onClose();
    } catch (error) {
      console.error("İçerik koleksiyona eklenemedi:", error);
    } finally {
      setAddingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-gray-100 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 tracking-tight">
            Koleksiyona Kaydet
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black transition-colors cursor-pointer"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto scrollbar-hide">
          {loading ? (
            <div className="py-6 text-center text-xs text-gray-400">
              Yükleniyor...
            </div>
          ) : collections.length > 0 ? (
            collections.map((col) => (
              <div
                key={col.id}
                onClick={() => handleSaveToCollection(col.id)}
                className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-black cursor-pointer transition-all group"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium text-gray-900 group-hover:text-black">
                    {col.name}
                  </span>
                  {col.description && (
                    <span className="text-[10px] text-gray-500 line-clamp-1">
                      {col.description}
                    </span>
                  )}
                </div>
                <button
                  disabled={addingId === col.id}
                  className="px-3 py-1.5 text-[11px] font-medium bg-gray-50 text-gray-700 rounded-lg group-hover:bg-black group-hover:text-white transition-colors"
                >
                  {addingId === col.id ? "Ekleniyor..." : "Ekle"}
                </button>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-xs text-gray-400">
              Henüz bir koleksiyonunuz yok.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
