"use client";

import { useAuth } from "@/context/UserContext";
import Home from "@/pages/Home";
import LoadingScreen from "@/components/LoadingScreen";
import { Project } from "@/services/server/post.service";
import LikedProjects from "./LikedProjects";

interface Props {
  initialProjects: Project[];
  initialPage: number;
  totalPages: number;
}

export default function LikedProjectsClient() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Home />;

  return (
    <>
      <LikedProjects />
    </>
  );
}
