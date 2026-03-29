"use client";

import { useEffect } from "react";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { useAuth } from "../../context/UserContext";
import LoadingScreen from "@/components/LoadingScreen";
import Image from "next/image";
import { undrawaddfiles } from "@/utils";
import BlogCardForProfile from "./BlogCardForProfile";
import { useGetUserBlogs } from "@/hooks/blogs/useGetUserBlogs";

const ProfileUserBlogs = ({ targetUserId }: { targetUserId: string | number }) => {
    const { user } = useAuth();
    const currentUserId = user?.id;
    console.log("targetUserId:", targetUserId);
    console.log("currentUserId:", currentUserId);
    const {
        userBlogs,
        isLoading,
        isLoadingMore,
        hasMore,
        loadMoreUserBlogs,
        getUserBlogs,
        currentPage,
        totalPages,
    } = useGetUserBlogs();

    // Infinite scroll için targetUserId ile
    useInfiniteScroll(
        () => {
            if (targetUserId) {
                loadMoreUserBlogs(targetUserId);
            }
        },
        hasMore,
        isLoadingMore,
        targetUserId // Reset when user changes
    );

    const handleBlogDelete = () => {
        // Blog silindikten sonra listeyi yeniden al
        getUserBlogs(targetUserId, 0, false);
    };

    useEffect(() => {
        if (targetUserId) {
            getUserBlogs(targetUserId);
        }
    }, [targetUserId, getUserBlogs]);

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <div className="w-full flex flex-col gap-5">
            {/* Bloglar Listesi */}
            {userBlogs && userBlogs.length > 0 ? (
                userBlogs.map((blog) => (
                    <BlogCardForProfile
                        key={blog.id}
                        blog={blog}
                        onDelete={handleBlogDelete}
                    />
                ))
            ) : targetUserId === currentUserId ? (
                <button className="col-span-full h-30 px-10 text-black border-2 border-gray-100 rounded-2xl flex items-center gap-8 group hover:shadow-md transition-shadow cursor-pointer">
                    <div className="relative">
                        <Image src={undrawaddfiles} alt="" width={100} />
                    </div>
                    <div className="w-full flex flex-col text-left">
                        <p className="text-xl">İlk blogunuzu yazın!</p>
                        <p className="text-xs opacity-50">
                            Yazılarınızı paylaşarak başkalarına ilham verin ve yaptığınız
                            çalışmaları kendi özel alanınızda sergileyin.
                        </p>
                    </div>
                    {/* <div className="w-12 h-12 overflow-hidden flex-shrink-0 rounded-full border shadow-lg text-white text-2xl flex items-center justify-center">
            <FaPlus className="text-gray-700 text-lg" />
          </div> */}
                </button>
            ) : (
                <p className="text-gray-500 text-xs">
                    Kullanıcı henüz bir blog paylaşmadı.
                </p>
            )}

            {/* Loading Göstergesi */}
            {isLoadingMore && (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <span className="ml-3 text-gray-600">
                        Daha fazla blog yükleniyor...
                    </span>
                </div>
            )}

            {/* Veri Bittiğinde Gösterilecek Mesaj */}
            {!hasMore && userBlogs.length > 0 && (
                <div className="flex justify-center items-center py-8">
                    <p className="text-gray-500 text-xs">Tüm bloglar yüklendi.</p>
                </div>
            )}

            {/* Sayfa Bilgisi */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center py-4">
                    <p className="text-sm text-gray-400">
                        Sayfa {currentPage + 1} / {totalPages} • {userBlogs.length} blog
                        gösteriliyor
                    </p>
                </div>
            )}
        </div>
    );
};

export default ProfileUserBlogs;