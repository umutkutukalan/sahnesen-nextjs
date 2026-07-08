"use client";

import { useEffect, useState } from "react";

import LoadingScreen from "@/components/LoadingScreen";
import PageAbout from "@/components/PageAbout";
import ProjectCard from "@/components/projects/ProjectCard";

import Notebook from "@/components/PageStickyExtra/Notebook";
import LikedPost from "@/components/PageStickyExtra/LikedPost";
import BookMark from "@/components/PageStickyExtra/BookMark";
import StickySiteRules from "@/components/PageStickyExtra/StickySiteRules";
import PopularProjects from "@/components/PageStickyExtra/PopularProjects";

import { useAuth } from "@/context/UserContext";
import { useGetProjects } from "@/hooks/projects/useGetProjects";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useGetUserLikedProjects } from "@/hooks/likes/useGetLikedProjects";
import { Project } from "@/services/server/post.service";
import { SiWikibooks } from "react-icons/si";
import { IoMdStats } from "react-icons/io";
import { LuScroll, LuSquareLibrary, LuTheater } from "react-icons/lu";
import { ImPencil2 } from "react-icons/im";
import { AiOutlineFileText } from "react-icons/ai";
import Image from "next/image";
import { sagperde, solperde } from "@/utils";
import { IoSparklesOutline } from "react-icons/io5";
import { RiUser6Line } from "react-icons/ri";
import { BiBookmarkAlt } from "react-icons/bi";

interface ProjectsProps {
  initialProjects: Project[];
  initialPage: number;
  totalPages: number;
}

const Projects = ({
  initialProjects,
  initialPage,
  totalPages,
}: ProjectsProps) => {
  const { user } = useAuth();

  console.log("Projects component rendered with:", {
    initialProjectsLength: initialProjects.length,
    initialPage,
    totalPages,
  });

  const { projects, isLoadingMore, hasMore, loadMoreProjects, currentPage } =
    useGetProjects(initialProjects, initialPage, totalPages);

  const { getUserLikedProjects, isLoading: isLoadingLikes } =
    useGetUserLikedProjects();

  // Infinite scroll
  const loadMoreRef = useInfiniteScroll(
    loadMoreProjects,
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
      <div className="relative flex w-full">
        {/* <div className="absolute left-0 top-0 z-0 opacity-80">
          <Image src={solperde} alt="Sol Perde" />
        </div> */}

        <div className="relative w-full flex flex-col">
          <div className="w-full h-10 bg-yellow-500 border-y border-black flex items-center justify-center">
            <p className="text-xs italic">
              Welcome Offer Access to everything. Now up to 60% off. Upgrade now
            </p>
          </div>

          <div className="relative flex w-full">
            {/* SOL ANA AKIŞ */}
            <div className="w-full lg:w-full flex flex-col border-gray-200 lg:border-r pb-5">
              <PageAbout
                pageTitle={{ text: "Projeler" }}
                contentType="Projects"
              />

              <div className="px-2 sm:px-20 z-50 pt-5">
                {/* PROJE LİSTESİ */}
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
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
              {!hasMore && projects.length > 0 && (
                <div className="py-8 text-center text-xs text-gray-500">
                  Tüm projeler yüklendi.
                </div>
              )}

              {/* SAYFA BİLGİSİ */}
              {totalPages > 1 && (
                <div className="py-4 text-center text-sm text-gray-400">
                  Sayfa {currentPage + 1} / {totalPages} • {projects.length}{" "}
                  proje
                </div>
              )}
            </div>

            {/* SAĞ STICKY SIDEBAR */}
            <aside className="relative hidden lg:flex lg:w-4/10 flex-col justify-between gap-4 sticky top-[64px] h-[calc(100vh-64px)] max-h-[calc(150vh)] px-10 pt-8 pb-5">
              {/* <div className="absolute right-0 top-0 z-0 opacity-60">
                <Image
                  src={sagperde}
                  alt="Sag Perde"
                  height={300}
                  width={300}
                />
              </div> */}

              {/* Popular: infinite listeye bağlı olmasın */}
              <PopularProjects projects={projects.slice(0, 4)} />

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
        </div>
      </div>

      {/* Global loading sadece küçük overlay */}
      {isLoadingLikes && <LoadingScreen />}
    </div>
  );
};

export default Projects;
