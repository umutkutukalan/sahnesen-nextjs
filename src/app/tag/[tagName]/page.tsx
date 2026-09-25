"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/services/client/config";
import { PostSummaryResponse } from "@/services/server/post.service";
import PostCard from "@/components/projects/PostCard";

export default function TagDetailPage() {
  const params = useParams();
  const tagName = params?.tagName as string;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostsByTag = async () => {
      if (!tagName) return;
      try {
        setLoading(true);
        // Backend'deki etiket adına göre post getiren endpoint'e istek atıyoruz
        const response = await api.get(
          `/api/posts/tag/${encodeURIComponent(tagName)}`,
        );
        setPosts(response.data.content || response.data || []);
      } catch (error) {
        console.error("Etikete ait gönderiler getirilemedi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostsByTag();
  }, [tagName]);

  return (
    <div className="min-h-screen bg-white text-black pt-16 pb-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-3 border-b border-gray-200 pb-2">
        <div className="text-[#7c7c7c] text-3xl">#</div>
        <div>
          <h1 className="text-4xl text-[#7c7c7c] merriweather-sans font-bold">
            {decodeURIComponent(tagName)}
          </h1>
          <p className="text-sm text-gray-400">
            etiketiyle oluşturulan sahneler
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Yükleniyor...</p>
      ) : posts.length === 0 ? (
        <p className="text-gray-500 text-xs">
          Bu etiket altında henüz bir sahne bulunmuyor.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post: PostSummaryResponse) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
