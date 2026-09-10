"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { IoIosPaper } from "react-icons/io";
import api from "@/services/client/config"; // veya axios kullanıyorsan import yolunu kendi yapılandırna göre ayarlayabilirsin
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
    <div className="min-h-screen bg-white text-black py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-700 text-xl font-serif">
          #
        </div>
        <div>
          <h1 className="text-2xl font-serif font-bold">
            {decodeURIComponent(tagName)}
          </h1>
          <p className="text-sm text-gray-400">
            Bu etiketle paylaşılan gönderiler
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Yükleniyor...</p>
      ) : posts.length === 0 ? (
        <p className="text-gray-500 text-sm">
          Bu etiket altında henüz bir gönderi bulunmuyor.
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
