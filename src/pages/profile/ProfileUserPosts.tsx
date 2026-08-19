"use client";

import { useEffect } from "react";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
// import { undrawaddfiles } from "../../utils";
import { useAuth } from "../../context/UserContext";
import LoadingScreen from "@/components/LoadingScreen";
import Image from "next/image";
import { undrawaddfiles } from "@/utils";
import { useGetUserPosts } from "@/hooks/projects/useGetUserPosts";
import PostCard from "@/components/projects/PostCard";
import { PostResponse } from "@/services/server/post.service";

const ProfileUserPosts = ({ targetUsername }: { targetUsername: string }) => {
  const { user } = useAuth();
  const currentUsername = user?.username;
  console.log("targetUserId:", targetUsername);
  console.log("currentUserId:", currentUsername);
  const {
    userPosts,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMoreUserPosts,
    getUserPosts,
    currentPage,
    totalPages,
  } = useGetUserPosts();

  // Infinite scroll için targetUserId ile
  useInfiniteScroll(
    () => {
      if (targetUsername) {
        loadMoreUserPosts(targetUsername);
      }
    },
    hasMore,
    isLoadingMore,
    targetUsername, // Reset when user changes
  );

  const handleProjectDelete = () => {
    // Proje silindikten sonra listeyi yeniden al
    getUserPosts(targetUsername, 0, false);
  };

  useEffect(() => {
    if (targetUsername) {
      getUserPosts(targetUsername);
    }
  }, [targetUsername, getUserPosts]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Projeler Listesi */}
      {userPosts && userPosts.length > 0 ? (
        userPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            showActions={targetUsername === currentUsername}
            onDelete={handleProjectDelete}
          />
        ))
      ) : targetUsername === currentUsername ? (
        <button className="col-span-full h-30 px-10 text-black border-2 border-gray-100 rounded-2xl flex items-center gap-8 group hover:shadow-md transition-shadow cursor-pointer">
          <div className="relative">
            <Image src={undrawaddfiles} alt="" width={100} />
          </div>
          <div className="w-full flex flex-col text-left">
            <p className="text-xl">İlk projenizi tanıtın!</p>
            <p className="text-xs opacity-50">
              Çalışmalarınızı paylaşarak başkalarına ilham verin ve yaptığınız
              çalışmaları kendi özel alanınızda sergileyin.
            </p>
          </div>
          {/* <div className="w-12 h-12 overflow-hidden flex-shrink-0 rounded-full border shadow-lg text-white text-2xl flex items-center justify-center">
            <FaPlus className="text-gray-700 text-lg" />
          </div> */}
        </button>
      ) : (
        <p className="text-gray-500 text-xs">
          Kullanıcı henüz bir proje paylaşmadı.
        </p>
      )}

      {/* Loading Göstergesi */}
      {isLoadingMore && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-3 text-gray-600">
            Daha fazla proje yükleniyor...
          </span>
        </div>
      )}

      {/* Veri Bittiğinde Gösterilecek Mesaj */}
      {!hasMore && userPosts.length > 0 && (
        <div className="flex justify-center items-center py-8">
          <p className="text-gray-500 text-xs">Tüm projeler yüklendi.</p>
        </div>
      )}

      {/* Sayfa Bilgisi */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center py-4">
          <p className="text-sm text-gray-400">
            Sayfa {currentPage + 1} / {totalPages} • {userPosts.length} proje
            gösteriliyor
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfileUserPosts;
