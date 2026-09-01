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
        .getLikedPosts(0, 5)
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
    <div className="min-h-screen flex w-full">
      <CollectionsView
        initialPosts={initialPosts}
        initialPage={initialPage}
        totalPages={totalPages}
      />
    </div>
  );
}
