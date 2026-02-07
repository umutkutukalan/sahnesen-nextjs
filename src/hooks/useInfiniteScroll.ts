"use client";
import { useEffect, useRef } from "react";

export const useInfiniteScroll = (
  onLoadMore: () => void,
  hasMore: boolean,
  isLoading: boolean
) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      {
        root: null,        // viewport
        rootMargin: "200px",
        threshold: 0,
      }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  return ref;
};