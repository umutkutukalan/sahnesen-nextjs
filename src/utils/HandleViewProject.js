import { generateSlug } from "./GenerateSlug";

export const handleViewProject = (project, router, username, title) => {
  const usernameSlug = generateSlug(username);
  const projectSlug = generateSlug(title);
  router.push(`/projeler/@${usernameSlug}/${projectSlug}`);
};


