"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useAuth } from "../../context/UserContext";
import LoadingScreen from "@/components/LoadingScreen";
import Image from "next/image";
import { undrawaddfiles } from "@/utils";
import { useGetUserPosts } from "@/hooks/projects/useGetUserPosts";
import PostCard from "@/components/projects/PostCard";

interface ProfileUserPostsProps {
  targetUsername: string;
  postType?: string;
}

const ProfileUserPosts = ({
  targetUsername,
  postType,
}: ProfileUserPostsProps) => {
  const { user } = useAuth();
  const currentUsername = user?.username;

  const {
    userPosts,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    loadMoreUserPosts,
  } = useGetUserPosts(targetUsername, postType);

  // Intersection Observer hook'u
  const { ref, inView } = useInView({
    threshold: 0.1,
  });

  // Ekranın altına gelindiğinde otomatik yeni sayfa çek
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      loadMoreUserPosts();
    }
  }, [inView, hasNextPage, isFetchingNextPage, loadMoreUserPosts]);

  // İlk yüklenme durumu
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Gönderiler Listesi */}
      {userPosts && userPosts.length > 0 ? (
        userPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            showActions={targetUsername === currentUsername}
            // onDelete prop'unu kaldırdık; silme işlemi useDeletePosts içindeki
            // queryClient.invalidateQueries sayesinde burayı otomatik re-render eder.
          />
        ))
      ) : targetUsername === currentUsername ? (
        <button className="col-span-full h-30 px-10 text-black border-2 border-gray-100 rounded-2xl flex items-center gap-8 group hover:shadow-md transition-shadow cursor-pointer">
          <div className="relative">
            <Image src={undrawaddfiles} alt="" width={100} />
          </div>
          <div className="w-full flex flex-col text-left">
            <p className="text-xl">
              {postType
                ? `İlk ${postType.toLowerCase()} içeriğinizi oluşturun!`
                : "İlk sahnenizi oluşturun!"}
            </p>
            <p className="text-xs opacity-50">
              Çalışmalarınızı paylaşarak başkalarına ilham verin ve yaptığınız
              çalışmaları kendi özel alanınızda sergileyin.
            </p>
          </div>
        </button>
      ) : (
        <p className="text-gray-500 text-xs">
          {postType
            ? `Kullanıcının bu kategoride (${postType}) henüz bir gönderisi yok.`
            : "Kullanıcı henüz bir gönderi paylaşmadı."}
        </p>
      )}

      {/* Otomatik Yükleme Tetikleyici (Observer Target) & Loading Göstergesi */}
      {hasNextPage && (
        <div ref={ref} className="flex justify-center items-center py-6">
          {isFetchingNextPage && (
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              <span className="text-xs text-gray-500">
                Daha fazla içerik yükleniyor...
              </span>
            </div>
          )}
        </div>
      )}

      {/* Veri Bittiğinde Gösterilecek Mesaj */}
      {!hasNextPage && userPosts && userPosts.length > 0 && (
        <div className="flex justify-center items-center py-8">
          <p className="text-gray-500 text-xs">Tüm içerikler yüklendi.</p>
        </div>
      )}
    </div>
  );
};

export default ProfileUserPosts;
