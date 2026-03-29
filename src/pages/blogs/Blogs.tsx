"use client";

import { useEffect } from "react";

import LoadingScreen from "@/components/LoadingScreen";
import PageAbout from "@/components/PageAbout";

import Notebook from "@/components/PageStickyExtra/Notebook";
import LikedPost from "@/components/PageStickyExtra/LikedPost";
import BookMark from "@/components/PageStickyExtra/BookMark";
import StickySiteRules from "@/components/PageStickyExtra/StickySiteRules";
import PopularProjects from "@/components/PageStickyExtra/PopularProjects";

import { useAuth } from "@/context/UserContext";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useGetUserLikedProjects } from "@/hooks/likes/useGetLikedProjects";
import { Blog } from "@/services/server/blog.service";
import { useGetBlogs } from "@/hooks/blogs/useGetBlogs";
import BlogCard from "@/components/blogs/BlogCard";

interface BlogsProps {
  initialBlogs: Blog[];
  initialPage: number;
  totalPages: number;
}

const Blogs = ({
  initialBlogs,
  initialPage,
  totalPages,
}: BlogsProps) => {
  const { user } = useAuth();

  console.log("Blogs component rendered with:", {
    initialBlogsLength: initialBlogs.length,
    initialPage,
    totalPages,
  });

  const { blogs, isLoadingMore, hasMore, loadMoreBlogs, currentPage } =
    useGetBlogs(initialBlogs, initialPage, totalPages);

  const { getUserLikedProjects, isLoading: isLoadingLikes } =
    useGetUserLikedProjects();

  // Infinite scroll
  const loadMoreRef = useInfiniteScroll(
    loadMoreBlogs,
    hasMore,
    isLoadingMore,
  );

  // Kullanıcı varsa liked projeleri çek
  useEffect(() => {
    if (user) {
      getUserLikedProjects(0, false);
    }
  }, [user, getUserLikedProjects]);

  return (
    <div className="page pt-16">
      <div className="flex w-full">
        {/* SOL ANA AKIŞ */}
        <div className="w-full lg:w-5/7 flex flex-col gap-5 border-gray-200 lg:border-r pb-5 px-2 sm:px-5">
          <PageAbout pageTitle={{ text: "Bloglar" }} contentType="Blogs" />

          {/* PROJE LİSTESİ */}
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}

          {hasMore && <div ref={loadMoreRef}></div>}

          {/* LOAD MORE */}
          {isLoadingMore && (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
              <span className="ml-3 text-gray-600">
                Daha fazla blog yükleniyor...
              </span>
            </div>
          )}

          {/* BİTTİ MESAJI */}
          {!hasMore && blogs.length > 0 && (
            <div className="py-8 text-center text-xs text-gray-500">
              Tüm bloglar yüklendi.
            </div>
          )}

          {/* SAYFA BİLGİSİ */}
          {totalPages > 1 && (
            <div className="py-4 text-center text-sm text-gray-400">
              Sayfa {currentPage + 1} / {totalPages} • {blogs.length} blog
            </div>
          )}
        </div>

        {/* SAĞ STICKY SIDEBAR */}
        <aside className="hidden lg:flex lg:w-2/7 flex-col justify-between gap-4 p-5 sticky top-[64px] h-[calc(100vh-64px)] max-h-[calc(150vh)]">
          {/* Popular: infinite listeye bağlı olmasın */}
          <PopularProjects projects={blogs.slice(0, 4)} />

          {user ? (
            <div className="flex flex-col gap-4">
              <Notebook />
              <LikedPost type="projects" />
              <BookMark />
              <StickySiteRules user={user} />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <StickySiteRules user={user} />
            </div>
          )}


        </aside>
      </div>

      {/* Global loading sadece küçük overlay */}
      {isLoadingLikes && <LoadingScreen />}
    </div>
  );
};

export default Blogs;
