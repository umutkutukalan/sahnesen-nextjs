import { generateSlug } from "./GenerateSlug";

export const handleViewProject = (project, router, username, slug) => {
  const usernameSlug = generateSlug(username);
  const projectSlug = slug;
  router.push(`/projeler/${usernameSlug}/${projectSlug}`);
};


