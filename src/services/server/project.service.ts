// services/server/project.service.ts

export interface Project {
  id: number;
  title: string;
  slug: string;
  content: any[];
  user: any;
  createdAt: string;
  image?: string;
}

export const getProjectBySlug = async (
  usernameSlug: string,
  projectSlug: string,
): Promise<Project | null> => {
  const res = await fetch(
    `${process.env.API_URL}/projects/${usernameSlug}/${projectSlug}`,
    {
      cache: "no-store",
      credentials: "include", // cookie auth varsa
    },
  );

  if (!res.ok) {
    return null;
  }

  return res.json();
};

export const getProjectsServer = async (page = 0, size = 5) => {
  console.log("API_URL:", process.env.API_URL);
  const res = await fetch(
    `${process.env.API_URL}/projects?page=${page}&size=${size}&sort=createdAt,desc`,
    {
      cache: "no-store", // feed her zaman güncel
    },
  );

  if (!res.ok) {
    throw new Error("Projects fetch failed");
  }

  return res.json(); // Spring Page<>
};
