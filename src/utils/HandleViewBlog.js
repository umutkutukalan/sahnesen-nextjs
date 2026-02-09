import { generateSlug } from "./GenerateSlug";

export const handleViewBlog = (blog, router, username, title) => {
  const usernameSlug = generateSlug(username);
  const blogSlug = generateSlug(title);
  router.push(`/bloglar/@${usernameSlug}/${blogSlug}`);
};


