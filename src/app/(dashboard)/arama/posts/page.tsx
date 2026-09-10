import { searchPostsClient } from "@/services/client/post.service";
import PostCard from "@/components/projects/PostCard";
import { PostSummaryResponse } from "@/services/server/post.service";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPostsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";

  let posts: PostSummaryResponse[] = [];
  try {
    if (query) {
      posts = await searchPostsClient(query);
    }
  } catch (error) {
    console.error("Yazılar aranamadı:", error);
  }

  if (!posts || posts.length === 0) {
    return (
      <p className="text-gray-500 text-sm">Bu kriterde yazı bulunamadı.</p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
