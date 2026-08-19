"use client";

import { useAuth } from "../../context/UserContext";
import LoadingScreen from "@/components/LoadingScreen";
import Image from "next/image";
import { undrawaddfiles } from "@/utils";
import { useGetUserPosts } from "@/hooks/projects/useGetUserPosts";
import PostCard from "@/components/projects/PostCard";

const ProfileUserPosts = ({ targetUsername }: { targetUsername: string }) => {
  const { user } = useAuth();
  const currentUsername = user?.username;

  // TanStack Query ile baştan yazdığımız hook
  const {
    userPosts,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    loadMoreUserPosts,
    refetch,
  } = useGetUserPosts(targetUsername);

  // Proje silindiğinde veriyi sıfırlayıp API'den taze çekmek için
  const handleProjectDelete = () => {
    refetch();
  };

  // İlk yüklenme durumu
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
        </button>
      ) : (
        <p className="text-gray-500 text-xs">
          Kullanıcı henüz bir proje paylaşmadı.
        </p>
      )}

      {/* Alt Katman Yükleniyor Göstergesi */}
      {isFetchingNextPage && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-3 text-gray-600">
            Daha fazla proje yükleniyor...
          </span>
        </div>
      )}

      {/* Daha Fazla Yükle Butonu (İstenirse intersection observer ile otomatikleştirilebilir) */}
      {hasNextPage && !isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <button
            onClick={() => loadMoreUserPosts()}
            className="px-6 py-2 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            Daha Fazla Proje Yükle
          </button>
        </div>
      )}

      {/* Veri Bittiğinde Gösterilecek Mesaj */}
      {!hasNextPage && userPosts.length > 0 && (
        <div className="flex justify-center items-center py-8">
          <p className="text-gray-500 text-xs">Tüm projeler yüklendi.</p>
        </div>
      )}
    </div>
  );
};

export default ProfileUserPosts;
