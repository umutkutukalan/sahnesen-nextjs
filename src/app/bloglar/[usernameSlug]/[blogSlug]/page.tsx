import Detail from "@/components/detail/Detail";
import { getBlogBySlug } from "@/services/server/blog.service";

interface PageProps {
  params: Promise<{
    usernameSlug: string;
    blogSlug: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { usernameSlug, blogSlug } = await params;

  console.log("Fetching blog with:", { usernameSlug, blogSlug });

  const blog = await getBlogBySlug(usernameSlug, blogSlug);

  if (!blog) {
    return (
      <div className="page flex items-center justify-center">
        <p>Blog bilgisi bulunamadı.</p>
      </div>
    );
  }

  return <Detail blog={blog} />;
}
