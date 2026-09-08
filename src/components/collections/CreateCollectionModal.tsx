"use client";

import {
  createCollectionClient,
  updateCollectionClient,
} from "@/services/client/collection/collection.service";
import { BookmarkCollection } from "@/services/client/interaction/interaction.service";
import { useEffect, useState } from "react";

interface CreateCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingCollection?: BookmarkCollection | null;
}

export default function CreateCollectionModal({
  isOpen,
  onClose,
  onSuccess,
  editingCollection = null,
}: CreateCollectionModalProps) {
  const [name, setName] = useState(editingCollection?.name || "");
  const [description, setDescription] = useState(
    editingCollection?.description || "",
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingCollection) {
      setName(editingCollection.name || "");
      setDescription(editingCollection.description || "");
    } else {
      setName("");
      setDescription("");
    }
  }, [editingCollection, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      if (editingCollection) {
        // Düzenleme İsteği
        await updateCollectionClient(editingCollection.id, {
          name,
          description,
        });
      } else {
        // Yeni Oluşturma İsteği
        await createCollectionClient({ name, description });
      }

      setName("");
      setDescription("");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Koleksiyon kaydedilemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  const isEditMode = !!editingCollection;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
            {isEditMode ? "Koleksiyonu Düzenle" : "Yeni Koleksiyon Oluştur"}
          </h2>
          <p className="text-xs text-gray-500">
            {isEditMode
              ? "Koleksiyon adını ve açıklamasını güncelleyebilirsin."
              : "Beğendiğin ve kaydettiğin sahneleri gruplamak için bir koleksiyon oluştur."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-700">
              Koleksiyon Adı
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Favori Tiyatrolarım"
              required
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-700">
              Açıklama (İsteğe bağlı)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Bu koleksiyon ne hakkında?"
              rows={3}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-black cursor-pointer transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-4 py-2 text-xs font-medium bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 cursor-pointer transition-colors"
            >
              {loading
                ? isEditMode
                  ? "Kaydediliyor..."
                  : "Oluşturuluyor..."
                : isEditMode
                  ? "Kaydet"
                  : "Oluştur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
