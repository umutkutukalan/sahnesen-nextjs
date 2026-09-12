import PostsClient from "@/pages/posts/PostsClient";
// Projendeki takip edilenler server servis fonksiyonunu buraya dahil etmelisin:
// import { getFollowingPostsServer } from "@/services/server/post.service";

export default async function SahnemdekilerPage() {
  const data = { content: [], number: 0, totalPages: 0 };

  try {
    // Örnek: data = await getFollowingPostsServer(0, 5);
  } catch (error) {
    console.error("Sahnemdekiler SSR Post fetch hatası:", error);
  }

  return (
    <PostsClient
      initialPosts={data?.content || []}
      initialPage={data?.number ?? 0}
      totalPages={data?.totalPages ?? 0}
      feedScope="following"
    />
  );
}
