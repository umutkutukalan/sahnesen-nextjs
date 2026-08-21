"use client";

import { useEffect } from "react";

import LoadingScreen from "@/components/LoadingScreen";
import PageAbout from "@/components/PageAbout";
import { useAuth } from "@/context/UserContext";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useGetUserLikedProjects } from "@/hooks/likes/useGetLikedProjects";
import { useSidebar } from "@/context/SidebarContext";
import { PostResponse } from "@/services/server/post.service";
import { useGetPosts } from "@/hooks/projects/useGetPosts";
import PostCard from "@/components/projects/PostCard";
import PopularPosts from "@/components/PageStickyExtra/PopularPosts";

interface PostsProps {
  initialPosts: PostResponse[];
  initialPage: number;
  totalPages: number;
}

const Posts = ({ initialPosts, initialPage, totalPages }: PostsProps) => {
  const { user } = useAuth();

  console.log("Posts component rendered with:", {
    initialPostsLength: initialPosts.length,
    initialPage,
    totalPages,
  });

  const { posts, isLoadingMore, hasMore, loadMorePosts, currentPage } =
    useGetPosts(initialPosts, initialPage, totalPages);

  const { getUserLikedProjects, isLoading: isLoadingLikes } =
    useGetUserLikedProjects();

  // Infinite scroll
  const loadMoreRef = useInfiniteScroll(loadMorePosts, hasMore, isLoadingMore);

  // Kullanıcı varsa liked projeleri çek
  useEffect(() => {
    if (user) {
      getUserLikedProjects(0, false);
    }
  }, [user, getUserLikedProjects]);

  const { isSidebarOpen } = useSidebar();

  return (
    <div className="page">
      <div className="relative flex w-full">
        {/* <div className="absolute left-0 top-0 z-0 opacity-80">
          <Image src={solperde} alt="Sol Perde" />
        </div> */}

        <div className="relative w-full flex flex-col">
          <div className="w-full h-10 bg-yellow-500 border-y border-black flex items-center justify-center">
            <p className="text-xs italic">
              {/* Welcome Offer Access to everything. Now up to 60% off. Upgrade now */}
            </p>
          </div>

          <div className="relative flex w-full">
            {/* SOL ANA AKIŞ */}
            <div className="w-full lg:w-full flex flex-col border-gray-200 lg:border-r pb-5">
              <div className="w-full flex flex-col items-center">
                <div className={`max-w-[700px] z-50 px-6`}>
                  <div className="w-full flex justify-center">
                    <PageAbout
                      pageTitle={{ text: "Projeler" }}
                      contentType="Projects"
                    />
                  </div>
                  {/* PROJE LİSTESİ */}
                  <div className="pt-5">
                    {posts.map((post) => (
                      <PostCard key={post?.id} post={post} />
                    ))}
                  </div>
                </div>
              </div>

              {hasMore && <div ref={loadMoreRef}></div>}

              {/* LOAD MORE */}
              {isLoadingMore && (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
                  <span className="ml-3 text-gray-600">
                    Daha fazla proje yükleniyor...
                  </span>
                </div>
              )}

              {/* BİTTİ MESAJI */}
              {!hasMore && posts.length > 0 && (
                <div className="py-8 text-center text-xs text-gray-500">
                  Tüm projeler yüklendi.
                </div>
              )}

              {/* SAYFA BİLGİSİ */}
              {totalPages > 1 && (
                <div className="py-4 text-center text-sm text-gray-400">
                  Sayfa {currentPage + 1} / {totalPages} • {posts.length} proje
                </div>
              )}
            </div>

            {/* SAĞ STICKY SIDEBAR */}
            <aside
              className={`relative hidden lg:flex ${isSidebarOpen ? "w-sm px-10" : "w-[500px] px-10"} transition-all duration-500 ease-in-out flex-col justify-between gap-4 sticky top-[64px] h-[calc(100vh-64px)] max-h-[calc(150vh)] pt-8 pb-5`}
            >
              {/* <div className="absolute right-0 top-0 z-0 opacity-60">
                <Image
                  src={sagperde}
                  alt="Sag Perde"
                  height={300}
                  width={300}
                />
              </div> */}

              <div className="w-[240px]">
                <PopularPosts posts={posts.slice(0, 4)} />
              </div>
              {/* Popular: infinite listeye bağlı olmasın */}
            </aside>
          </div>
        </div>
      </div>

      {/* Global loading sadece küçük overlay */}
      {isLoadingLikes && <LoadingScreen />}
    </div>
  );
};

export default Posts;
