// services/client/likes/like.service.ts

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const likeService = {
    getUserProjectsLikes: async (userId: number | string, page = 0, size = 5) => {
        const params = new URLSearchParams({
            page: String(page),
            size: String(size),
            sort: "createdAt,desc",
        });

        const response = await fetch(
            `${BASE_URL}/users/${userId}/liked-projects?${params}`,
            {
                credentials: "include",
            },
        );

        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        return response.json();
    },

    getLikeCountProject: async (projectId: number | string) => {
        const response = await fetch(
            `${BASE_URL}/projects/${projectId}/like/count`,
            { credentials: "include" },
        );
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        return response.json();
    },

    getLikeCountBlog: async (blogId: number | string) => {
        const response = await fetch(
            `${BASE_URL}/blogs/${blogId}/like/count`,
            { credentials: "include" },
        );
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        return response.json();
    },

    hasUserLikedProject: async (projectId: number | string) => {
        const response = await fetch(
            `${BASE_URL}/projects/${projectId}/like/status`,
            { credentials: "include" },
        );
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        return response.json();
    },

    hasUserLikedBlog: async (blogId: number | string) => {
        const response = await fetch(
            `${BASE_URL}/blogs/${blogId}/like/status`,
            { credentials: "include" },
        );
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        return response.json();
    },
};