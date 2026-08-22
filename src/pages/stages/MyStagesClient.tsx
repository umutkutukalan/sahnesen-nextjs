"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/UserContext";
import LoadingScreen from "@/components/LoadingScreen";
import Home from "@/pages/Home";
import { getMyPostsClient } from "@/services/client/post.service";
import { PostResponse } from "@/services/server/post.service";
import PostCard from "@/components/projects/PostCard";

export default function MyStagesClient() {
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<"PUBLISHED" | "DRAFT">(
    "PUBLISHED",
  );
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMyPosts = useCallback(
    async (selectedTab: "PUBLISHED" | "DRAFT", pageNum: number) => {
      setLoading(true);
      try {
        const isPublished = selectedTab === "PUBLISHED";
        // Backend'deki getUserPosts / getMyPosts servisinize istek atıyoruz
        const response = await getMyPostsClient({
          isPublished,
          postType: "ALL",
          page: pageNum,
          size: 10,
        });

        setPosts(response.content);
        setTotalPages(response.totalPages);
        setPage(response.number);
      } catch (error) {
        console.error("Sahnelerim çekilirken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (user) {
      fetchMyPosts(activeTab, 0);
    }
  }, [user, activeTab, fetchMyPosts]);

  if (authLoading) return <LoadingScreen />;
  if (!user) return <Home />;

  return (
    <main className="min-h-screen bg-white text-black py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Üst Başlık */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-5 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Sahnelerim
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Yazdığın tüm içerikleri, taslakları ve yayınlanmış sahnelerini
            buradan yönetebilirsin.
          </p>
        </div>
      </div>

      {/* Sekmeler (Tabs) */}
      <div className="flex space-x-6 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("PUBLISHED")}
          className={`pb-3 text-sm font-medium transition-colors relative ${
            activeTab === "PUBLISHED"
              ? "text-black border-b-2 border-black"
              : "text-gray-400 hover:text-gray-700"
          }`}
        >
          Yayınlananlar
        </button>
        <button
          onClick={() => setActiveTab("DRAFT")}
          className={`pb-3 text-sm font-medium transition-colors relative ${
            activeTab === "DRAFT"
              ? "text-black border-b-2 border-black"
              : "text-gray-400 hover:text-gray-700"
          }`}
        >
          Taslaklar
        </button>
      </div>

      {/* İçerik Listesi */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 bg-gray-50 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-500 text-sm">
            {activeTab === "PUBLISHED"
              ? "Henüz yayınlanmış bir sahnen bulunmuyor."
              : "Henüz kaydedilmiş bir taslağın yok."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isOwner={true}
              showReadButton={activeTab === "PUBLISHED"} // <-- YAYINLANANLARDA TRUE, TASLAKLARDA FALSE
              onDelete={() => fetchMyPosts(activeTab, page)} // Silme işleminden sonra listeyi tazelemek için
            />
          ))}
        </div>
      )}
    </main>
  );
}
