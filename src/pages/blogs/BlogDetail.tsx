import Detail from "@/components/detail/Detail";
import { getBlogBySlug } from "@/services/server/blog.service";

export interface BlogDetailProps {
  params: {
    usernameSlug: string;
    blogSlug: string;
  };
}
const BlogDetail = async ({ params }: BlogDetailProps) => {
  const blog = await getBlogBySlug(
    params.usernameSlug,
    params.blogSlug,
  );

  if (!blog) {
    return (
      <div className="page flex items-center justify-center">
        <p>Blog bilgisi bulunamadı.</p>
      </div>
    );
  }

  return <Detail project={blog} />;
};

export default BlogDetail;
