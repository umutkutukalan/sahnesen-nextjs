"use client";

import { useState, useEffect } from "react";
import {
  interactionService,
  ReactionType,
  PostInteractionStatus,
} from "@/services/client/interaction/interaction.service";

export const usePostInteraction = (postId: number) => {
  const [status, setStatus] = useState<PostInteractionStatus>({
    isLiked: false,
    isShined: false,
    isBookmarked: false,
    likeCount: 0,
    shineCount: 0,
  });

  // Başlangıç değerini postId durumuna göre belirliyoruz
  const [isLoading, setIsLoading] = useState<boolean>(!!postId);

  useEffect(() => {
    if (!postId) return;

    let isMounted = true;

    interactionService
      .getPostInteractionStatus(postId)
      .then((data) => {
        if (isMounted) setStatus(data);
      })
      .catch((err) => console.error("Post etkileşim durumu alınamadı:", err))
      .finally(() => {
        if (isMounted) setIsLoading(false); // Asenkron işlem bittiğinde state güncellemek güvenlidir
      });

    return () => {
      isMounted = false;
    };
  }, [postId]);

  const toggleReaction = async (reactionType: ReactionType) => {
    const isLike = reactionType === "LIKE";
    const key = isLike ? "isLiked" : "isShined";
    const countKey = isLike ? "likeCount" : "shineCount";

    // UI'ı anında iyimser güncelle
    setStatus((prev) => ({
      ...prev,
      [key]: !prev[key],
      [countKey]: prev[key] ? prev[countKey] - 1 : prev[countKey] + 1,
    }));

    try {
      await interactionService.toggleReaction(postId, reactionType);
    } catch (error) {
      // Hata durumunda UI'ı geri al
      setStatus((prev) => ({
        ...prev,
        [key]: !prev[key],
        [countKey]: prev[key] ? prev[countKey] + 1 : prev[countKey] - 1,
      }));
      console.error("Reaksiyon hatası:", error);
    }
  };

  const toggleBookmark = async (collectionId?: number) => {
    setStatus((prev) => ({ ...prev, isBookmarked: !prev.isBookmarked }));

    try {
      await interactionService.toggleBookmark(postId, collectionId);
    } catch (error) {
      setStatus((prev) => ({ ...prev, isBookmarked: !prev.isBookmarked }));
      console.error("Kaydetme hatası:", error);
    }
  };

  return {
    status,
    isLoading,
    toggleLike: () => toggleReaction("LIKE"),
    toggleShine: () => toggleReaction("SHINE"),
    toggleBookmark,
  };
};
