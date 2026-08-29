"use client";

import { useAuth } from "@/context/UserContext";
import Home from "@/pages/Home";
import LoadingScreen from "@/components/LoadingScreen";

import { PostResponse } from "@/services/server/post.service";
import Posts from "./Posts";

interface Props {
  initialPosts: PostResponse[];
  initialPage: number;
  totalPages: number;
}

export default function PostsClient({
  initialPosts,
  initialPage,
  totalPages,
}: Props) {
  console.log("PostsClient rendered with props:", {
    initialPosts,
    initialPage,
    totalPages,
  });

  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Home />;

  return (
    <>
      <div className="min-h-screen flex">
        <Posts
          initialPosts={initialPosts}
          initialPage={initialPage}
          totalPages={totalPages}
        />
      </div>
    </>
  );
}
