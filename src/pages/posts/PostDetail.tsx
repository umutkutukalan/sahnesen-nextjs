// app/profile/[usernameSlug]/[postSlug]/page.tsx

import Detail from "@/components/detail/Detail";
import { getPostDetailServer } from "@/services/server/post.service";

export interface PostDetailProps {
  params: Promise<{
    usernameSlug: string;
    postSlug: string;
  }>;
}

const PostDetail = async ({ params }: PostDetailProps) => {
  // 🔑 Next.js 15: params Promise olduğu için await ediyoruz
  const { postSlug } = await params;

  // Server servisini çağırıyoruz
  const post = await getPostDetailServer(postSlug);

  if (!post) {
    return (
      <div className="page flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500 text-sm">
          İçerik bulunamadı veya kaldırılmış olabilir.
        </p>
      </div>
    );
  }

  return <Detail post={post} />;
};

export default PostDetail;
