"use client";

import { useUser } from "@/context/UserContext";
import Home from "@/pages/Home";
import LoadingScreen from "@/components/LoadingScreen";
import Projects from "./Projects";
import { Project } from "@/services/server/project.service";

interface Props {
  initialProjects: Project[];
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

  const { user, loading } = useUser();

  if (loading) return <LoadingScreen />;
  if (!user) return <Home />;

  return (
    <Projects
      initialProjects={initialProjects}
      initialPage={initialPage}
      totalPages={totalPages}
    />
  );
}
