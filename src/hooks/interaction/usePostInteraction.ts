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

  // ... rest of hook
};
