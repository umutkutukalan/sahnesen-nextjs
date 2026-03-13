"use client";

import { useUser } from "@/context/UserContext";
import Home from "@/pages/Home";
import LoadingScreen from "@/components/LoadingScreen";
import Navbar from "@/components/navbar/Navbar";
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

  const { user, loading } = useUser();

  if (loading) return <LoadingScreen />;
  if (!user) return <Home />;

  return (
    <>
      <Navbar transparent={false} />
      <Blogs
        initialBlogs={initialBlogs}
        initialPage={initialPage}
        totalPages={totalPages}
      />
    </>
  );
}
