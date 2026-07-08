"use client";

import { useAuth } from "@/context/UserContext";
import Home from "@/pages/Home";
import LoadingScreen from "@/components/LoadingScreen";
import Projects from "./Projects";
import { PostResponse } from "@/services/server/post.service";
import Navbar from "@/components/navbar/Navbar";
import Sidebar from "@/components/navbar/Sidebar";

interface Props {
  initialProjects: PostResponse[];
  initialPage: number;
  totalPages: number;
}

export default function ProjectsClient({
  initialProjects,
  initialPage,
  totalPages,
}: Props) {
  console.log("ProjectsClient rendered with props:", {
    initialProjects,
    initialPage,
    totalPages,
  });

  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Home />;

  return (
    <>
      <Navbar transparent={false} />
      <div className="min-h-screen flex">
        <Sidebar />
        <Projects
          initialProjects={initialProjects}
          initialPage={initialPage}
          totalPages={totalPages}
        />
      </div>
    </>
  );
}
