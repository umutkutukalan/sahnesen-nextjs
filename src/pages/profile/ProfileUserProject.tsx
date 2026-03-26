"use client";

import { useEffect } from "react";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import ProjectCardForProfile from "./ProjectCardForProfile";
// import { undrawaddfiles } from "../../utils";
import { useUser } from "../../context/UserContext";
import LoadingScreen from "@/components/LoadingScreen";
import { useGetUserProjects } from "@/hooks/projects/useGetUserProjects";
import Image from "next/image";

const ProfileUserProjects = ({ targetUserId }: { targetUserId: string | number }) => {
    const { user } = useUser();
    const currentUserId = user?.id;
    console.log("targetUserId:", targetUserId);
    console.log("currentUserId:", currentUserId);
    const {
        userProjects,
        isLoading,
        isLoadingMore,
        hasMore,
        loadMoreUserProjects,
        getUserProjects,
        currentPage,
        totalPages,
    } = useGetUserProjects();

    // Infinite scroll için targetUserId ile
    useInfiniteScroll(
        () => {
            if (targetUserId) {
                loadMoreUserProjects(targetUserId);
            }
        },
        hasMore,
        isLoadingMore,
        targetUserId // Reset when user changes
    );

    const handleProjectDelete = () => {
        // Proje silindikten sonra listeyi yeniden al
        getUserProjects(targetUserId, 0, false);
    };

    useEffect(() => {
        if (targetUserId) {
            getUserProjects(targetUserId);
        }
    }, [targetUserId, getUserProjects]);

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <div className="w-full flex flex-col gap-5">
            {/* Projeler Listesi */}
            {userProjects && userProjects.length > 0 ? (
                userProjects.map((project) => (
                    <ProjectCardForProfile
                        key={project.id}
                        project={project}
                        onDelete={handleProjectDelete}
                    />
                ))
            ) : targetUserId === currentUserId ? (
                <button className="col-span-full h-30 px-10 text-black border-2 border-gray-100 rounded-2xl flex items-center gap-8 group hover:shadow-md transition-shadow cursor-pointer">
                    {/* <div className="relative">
                        <Image src={undrawaddfiles} alt="" width={100} />
                    </div> */}
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
            {!hasMore && userProjects.length > 0 && (
                <div className="flex justify-center items-center py-8">
                    <p className="text-gray-500 text-xs">Tüm projeler yüklendi.</p>
                </div>
            )}

            {/* Sayfa Bilgisi */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center py-4">
                    <p className="text-sm text-gray-400">
                        Sayfa {currentPage + 1} / {totalPages} • {userProjects.length} proje
                        gösteriliyor
                    </p>
                </div>
            )}
        </div>
    );
};

export default ProfileUserProjects;