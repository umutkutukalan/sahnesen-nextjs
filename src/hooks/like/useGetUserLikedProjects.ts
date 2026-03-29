// hooks/likes/useGetUserLikedProjects.ts
"use client";

import { likeService } from "@/services/client/likes/like.service";
import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/context/UserContext";

export const useGetUserLikedProjects = () => {
    const { user } = useAuth();
    const userId = user?.id;

    const [likedProjects, setLikedProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const getUserLikedProjects = useCallback(
        async (page = 0, isLoadMore = false) => {
            try {
                isLoadMore ? setIsLoadingMore(true) : setIsLoading(true);

                const data = await likeService.getUserProjectsLikes(userId, page, 5);
                const newProjects = data.content || data;

                if (isLoadMore) {
                    setLikedProjects((prev) => {
                        const existingIds = new Set(prev.map((p: any) => p.id));
                        return [...prev, ...newProjects.filter((p: any) => !existingIds.has(p.id))];
                    });
                } else {
                    setLikedProjects(newProjects);
                }

                if (data.totalPages !== undefined) {
                    setTotalPages(data.totalPages);
                    setCurrentPage(data.number || page);
                    setHasMore(data.number + 1 < data.totalPages);
                } else {
                    setHasMore(newProjects.length === 5);
                    setCurrentPage(page);
                }
            } catch (error) {
                console.error("Beğenilen projeler çekilirken hata:", error);
            } finally {
                setIsLoading(false);
                setIsLoadingMore(false);
            }
        },
        [userId],
    );

    const loadMoreLikedProjects = useCallback(() => {
        if (!isLoadingMore && hasMore) {
            getUserLikedProjects(currentPage + 1, true);
        }
    }, [currentPage, hasMore, isLoadingMore, getUserLikedProjects]);

    useEffect(() => {
        if (userId) getUserLikedProjects(0, false);
    }, [userId]);

    return {
        likedProjects,
        isLoading,
        isLoadingMore,
        hasMore,
        currentPage,
        totalPages,
        getUserLikedProjects,
        loadMoreLikedProjects,
    };
};