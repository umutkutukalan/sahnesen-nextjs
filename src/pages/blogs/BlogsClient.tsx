"use client";

import { useAuth } from "@/context/UserContext";
import Home from "@/pages/Home";
import LoadingScreen from "@/components/LoadingScreen";
import { Blog } from "@/services/server/blog.service";
import Blogs from "./Blogs";

interface Props {
  initialBlogs: Blog[];
  initialPage: number;
  totalPages: number;
}

export default function BlogsClient({
  initialBlogs,
  initialPage,
  totalPages,
}: Props) {
  console.log("BlogsClient rendered with props:", {
    initialBlogs,
    initialPage,
    totalPages,
  });

  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Home />;

  return (
    <>
      <Blogs
        initialBlogs={initialBlogs}
        initialPage={initialPage}
        totalPages={totalPages}
      />
    </>
  );
}
