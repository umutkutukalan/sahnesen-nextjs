"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/UserContext";
import Home from "@/pages/Home";
import LoadingScreen from "@/components/LoadingScreen";
import CollectionsView from "@/pages/collections/CollectionsView";
import { interactionService } from "@/services/client/interaction/interaction.service";
import { PostResponse } from "@/services/server/post.service";

export default function Page() {
  const { user, loading } = useAuth();
  const [initialPosts, setInitialPosts] = useState<PostResponse[]>([]);
  const [initialPage, setInitialPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      interactionService
        .getLikedPosts(undefined, 0, 5) // (postType, page, size) sırasına dikkat!
        .then((data) => {
          setInitialPosts(data?.content || []);
          setInitialPage(data?.number || 0);
          setTotalPages(data?.totalPages || 0);
        })
        .catch((err) => {
          console.error("Beğenilen postlar çekilemedi:", err);
        })
        .finally(() => {
          setIsDataLoading(false);
        });
    }
  }, [user]);

  if (loading || (user && isDataLoading)) return <LoadingScreen />;
  if (!user) return <Home />;

  return (
    <main className="min-h-screen bg-white text-black py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col gap-5">
      <CollectionsView
        initialPosts={initialPosts}
        initialPage={initialPage}
        totalPages={totalPages}
      />
    </main>
  );
}
