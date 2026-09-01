"use client";

import { useAuth } from "@/context/UserContext";
import Home from "@/pages/Home";
import LoadingScreen from "@/components/LoadingScreen";
import { PostResponse } from "@/services/server/post.service";
import CollectionsView from "@/pages/collections/CollectionsView";

interface Props {
  initialPosts: PostResponse[];
  initialPage: number;
  totalPages: number;
}

export default function CollectionsClient({
  initialPosts,
  initialPage,
  totalPages,
}: Props) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
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
