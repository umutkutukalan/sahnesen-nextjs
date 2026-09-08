// MyStagesClient.tsx (Arşiv Sekmesi, Sayımları ve İşlemleri Tam Entegre Edilmiş Hali)

"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/UserContext";
import LoadingScreen from "@/components/LoadingScreen";
import Home from "@/pages/Home";
import {
  getMyPostsClient,
  toggleArchivePostClient,
} from "@/services/client/post.service";
import { PostResponse } from "@/services/server/post.service";
import PostCard from "@/components/projects/PostCard";
import Image from "next/image";
import { sahnelerim } from "@/utils";
import { FaTicketSimple } from "react-icons/fa6";
import api from "@/services/client/config";

export default function MyStagesClient() {
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<"PUBLISHED" | "DRAFT" | "ARCHIVE">(
    "PUBLISHED",
  );
  const [selectedType, setSelectedType] = useState<string | undefined>(
    undefined,
  );
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [page, setPage] = useState<number>(0);
  const [counts, setCounts] = useState<{
    published: number;
    draft: number;
    archive: number;
  }>({
    published: 0,
    draft: 0,
    archive: 0,
  });
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMyPosts = useCallback(
    async (
      selectedTab: "PUBLISHED" | "DRAFT" | "ARCHIVE",
      pageNum: number,
      postType?: string,
    ) => {
      setLoading(true);
      try {
        let isPublished: boolean | undefined = undefined;
        let isArchived = false;

        if (selectedTab === "PUBLISHED") {
          isPublished = true;
          isArchived = false;
        } else if (selectedTab === "DRAFT") {
          isPublished = false;
          isArchived = false;
        } else if (selectedTab === "ARCHIVE") {
          isArchived = true;
        }

        const response = await getMyPostsClient({
          isPublished,
          isArchived,
          postType: postType || "ALL",
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

  const fetchCounts = useCallback(async (postType?: string) => {
    try {
      const queryParam = postType ? `?postType=${postType}` : "";
      const res = await api.get(`/api/posts/me/counts${queryParam}`);
      setCounts(res.data);
    } catch (error) {
      console.error("Sayılar alınamadı:", error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchCounts(selectedType);
      fetchMyPosts(activeTab, 0, selectedType);
    }
  }, [user, activeTab, selectedType, fetchMyPosts, fetchCounts]);

  const handleSelectType = (type: string) => {
    if (selectedType === type) {
      setSelectedType(undefined);
    } else {
      setSelectedType(type);
    }
  };

  const handleArchiveToggle = async (postId: number) => {
    try {
      await toggleArchivePostClient(postId);
      fetchCounts(selectedType);
      fetchMyPosts(activeTab, page, selectedType);
    } catch (error) {
      console.error("Arşiv durumu değiştirilirken hata oluştu:", error);
    }
  };

  console.log("posts", posts);

  if (authLoading) return <LoadingScreen />;
  if (!user) return <Home />;

  return (
    <main className="min-h-screen bg-white text-black py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col gap-5">
      <div className="flex items-end gap-4">
        <div className="relative">
          <Image
            src={sahnelerim}
            alt="Sahnelerim"
            className="w-34 h-28 object-cover"
          />
        </div>
        <div className="flex flex-col gap-4">
          <div
            className="flex flex-col gap-2 border-b border-gray-200"
            style={{
              paddingBottom: "8px",
            }}
          >
            <h1 className="text-3xl font-semibold tracking-tight merriweather-sans text-gray-900">
              Sahnelerim
            </h1>
            <p className="text-xs text-gray-500">
              Yayınladığın, henüz tamamlamadığın ve arşivinde sakladığın
              sahneler
            </p>
          </div>
          <div className="flex items-center gap-2 select-none">
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-800">{counts.published}</span>
              <span className="text-xs text-gray-500">Sahnelenen</span>
            </div>
            <span className="text-xs text-gray-500">•</span>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-800">{counts.draft}</span>
              <span className="text-xs text-gray-500">Taslak</span>
            </div>
            <span className="text-xs text-gray-500">•</span>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-800">{counts.archive}</span>
              <span className="text-xs text-gray-500">Arşiv</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Üst Sekmeler ve Tür Filtreleri */}
        <div
          className="w-full relative flex items-end justify-between border-b border-gray-100 bg-white"
          style={{ height: "48px" }}
        >
          {/* Sol taraf: Sekmeler */}
          <div className="flex space-x-6">
            <button
              onClick={() => setActiveTab("PUBLISHED")}
              className={`pb-3 text-xs font-medium transition-colors relative cursor-pointer ${
                activeTab === "PUBLISHED"
                  ? "text-black border-b-2 border-black"
                  : "text-gray-500"
              }`}
            >
              Sahnede
            </button>
            <button
              onClick={() => setActiveTab("DRAFT")}
              className={`pb-3 text-xs font-medium transition-colors relative cursor-pointer ${
                activeTab === "DRAFT"
                  ? "text-black border-b-2 border-black"
                  : "text-gray-500"
              }`}
            >
              Taslaklar
            </button>
            <button
              onClick={() => setActiveTab("ARCHIVE")}
              className={`pb-3 text-xs font-medium transition-colors relative cursor-pointer ${
                activeTab === "ARCHIVE"
                  ? "text-black border-b-2 border-black"
                  : "text-gray-500"
              }`}
            >
              Arşiv
            </button>
          </div>

          {/* Sağ taraf: İçerik Türü Filtreleri */}
          <div className="relative h-12 flex items-end justify-end">
            <ul className="relative z-50 flex items-end justify-end gap-5 overflow-x-auto scrollbar-hide">
              <button
                type="button"
                className={`pb-3 flex items-center gap-1.5 cursor-pointer transition-all ${
                  selectedType === undefined
                    ? "border-b-2 border-black font-medium"
                    : "text-gray-400 hover:text-gray-700"
                }`}
                onClick={() => setSelectedType(undefined)}
              >
                <span className="text-xs">Tümü</span>
              </button>

              <button
                type="button"
                className={`pb-3 flex items-center gap-1.5 cursor-pointer transition-all ${
                  selectedType === "SAHNE"
                    ? "border-b-2 font-medium"
                    : "text-gray-400 hover:text-gray-700"
                }`}
                style={{
                  borderColor: selectedType === "SAHNE" ? "#c86b5a" : undefined,
                }}
                onClick={() => handleSelectType("SAHNE")}
              >
                <FaTicketSimple
                  className="text-base"
                  style={{ color: "#c86b5a" }}
                />
                <span className="text-xs">Sahne</span>
              </button>

              <button
                type="button"
                className={`pb-3 flex items-center gap-1.5 cursor-pointer transition-all ${
                  selectedType === "MONOLOG"
                    ? "border-b-2 font-medium"
                    : "text-gray-400 hover:text-gray-700"
                }`}
                style={{
                  borderColor:
                    selectedType === "MONOLOG" ? "#66788a" : undefined,
                }}
                onClick={() => handleSelectType("MONOLOG")}
              >
                <FaTicketSimple
                  className="text-base"
                  style={{ color: "#66788a" }}
                />
                <span className="text-xs">Monolog</span>
              </button>

              <button
                type="button"
                className={`pb-3 flex items-center gap-1.5 cursor-pointer transition-all ${
                  selectedType === "YANYANA"
                    ? "border-b-2 font-medium"
                    : "text-gray-400 hover:text-gray-700"
                }`}
                style={{
                  borderColor:
                    selectedType === "YANYANA" ? "#789680" : undefined,
                }}
                onClick={() => handleSelectType("YANYANA")}
              >
                <FaTicketSimple
                  className="text-base"
                  style={{ color: "#789680" }}
                />
                <span className="text-xs">Yan Yana</span>
              </button>

              <button
                type="button"
                className={`pb-3 flex items-center gap-1.5 cursor-pointer transition-all ${
                  selectedType === "TERSYUZ"
                    ? "border-b-2 font-medium"
                    : "text-gray-400 hover:text-gray-700"
                }`}
                style={{
                  borderColor:
                    selectedType === "TERSYUZ" ? "#f4d45f" : undefined,
                }}
                onClick={() => handleSelectType("TERSYUZ")}
              >
                <FaTicketSimple
                  className="text-base"
                  style={{ color: "#f4d45f" }}
                />
                <span className="text-xs">Tersyüz</span>
              </button>
            </ul>
          </div>
        </div>

        {/* İçerik Listesi */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-32 bg-gray-50 animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="">
            <p className="text-gray-500 text-xs">
              {activeTab === "PUBLISHED"
                ? "Henüz yayınladığın bir sahnen yok."
                : activeTab === "DRAFT"
                  ? "Henüz kaydedilmiş bir taslağın yok."
                  : "Henüz arşivlediğin bir sahnen yok."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {posts.map((post) => (
              <PostCard
                key={post?.id}
                post={post}
                isOwner={true}
                showReadButton={activeTab === "PUBLISHED"}
                onDelete={() => fetchMyPosts(activeTab, page, selectedType)}
                onArchive={() => handleArchiveToggle(post?.id)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
