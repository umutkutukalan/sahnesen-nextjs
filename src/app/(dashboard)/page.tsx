import PostsClient from "@/pages/posts/PostsClient";
import { getPublishedPostsServer } from "@/services/server/post.service";

export default async function FuayePage() {
  let data = { content: [], number: 0, totalPages: 0 };

  try {
    data = await getPublishedPostsServer(0, 5);
  } catch (error) {
    console.error("Fuaye SSR Post fetch hatası:", error);
  }

  return (
    <PostsClient
      initialPosts={data?.content || []}
      initialPage={data?.number ?? 0}
      totalPages={data?.totalPages ?? 0}
      feedScope="all"
    />
  );
}
