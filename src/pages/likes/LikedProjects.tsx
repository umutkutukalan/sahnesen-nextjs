import { useEffect } from "react";
import Image from "next/image";
import Notebook from "@/components/PageStickyExtra/Notebook";
import BookMark from "@/components/PageStickyExtra/BookMark";
import { undrawloveit } from "@/utils";
import { useAuth } from "@/context/UserContext";
import PopularProjects from "@/components/PageStickyExtra/PopularPosts";
import StickySiteRules from "@/components/PageStickyExtra/StickySiteRules";
import PageAbout from "@/components/PageAbout";
import LoadingScreen from "@/components/LoadingScreen";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import ProjectCard from "@/components/projects/PostCard";
import { useGetUserLikedProjects } from "@/hooks/like/useGetUserLikedProjects";

const LikedProjects = () => {
  const { user } = useAuth();

  const {
    getUserLikedProjects,
    likedProjects,
    isLoading,
    hasMore,
    isLoadingMore,
    loadMoreLikedProjects,
    currentPage,
    totalPages,
  } = useGetUserLikedProjects();

  // Infinite scroll hook'unu kullan
  useInfiniteScroll(loadMoreLikedProjects, hasMore, isLoadingMore);

  useEffect(() => {
    if (user) {
      getUserLikedProjects(0, false);
    }
  }, [user, getUserLikedProjects]);
  console.log("Liked Projects:", likedProjects);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="page pt-16">
      <div className="w-full flex">
        <div className="w-5/7 flex flex-col gap-5 border-r pb-5 px-5 border-gray-200">
          {likedProjects.length > 0 && (
            <PageAbout
              pageTitle={{
                text: "Beğendiğin Projeler",
              }}
              contentType={"Projects"}
            />
          )}

          {likedProjects.length === 0 && (
            <div className="flex flex-col p-5 h-full w-full justify-center items-center text-center rounded-lg">
              <Image
                src={undrawloveit}
                alt="No Projects"
                className="mb-4"
                width={100}
              />
              <p className="text-xl font-medium mb-2 text-blue-700">
                Henüz proje beğenmedin!
              </p>
              <p className="text-xs opacity-60">
                Beğendiğin projeler burada görünecek. İlham almak ve topluluğu
                desteklemek için projelere göz at!
              </p>
            </div>
          )}

          {/* Projeler Listesi */}
          {likedProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}

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
          {!hasMore && likedProjects.length > 0 && (
            <div className="flex justify-center items-center py-8">
              <p className="text-gray-500 text-xs">Tüm projeler yüklendi.</p>
            </div>
          )}

          {/* Sayfa Bilgisi */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center py-4">
              <p className="text-sm text-gray-400">
                Sayfa {currentPage + 1} / {totalPages} • {likedProjects.length}{" "}
                proje gösteriliyor
              </p>
            </div>
          )}
        </div>
        <div
          className="w-2/7 h-[calc(100vh-64px)] max-h-[calc(150vh)] flex flex-col justify-between gap-4 p-5"
          style={{ position: "sticky", top: "64px" }}
        >
          <PopularProjects projects={likedProjects} />
          {user ? (
            <div className="flex flex-col gap-4">
              <Notebook />
              <BookMark />
              <StickySiteRules user={user} />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <StickySiteRules user={user} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LikedProjects;
