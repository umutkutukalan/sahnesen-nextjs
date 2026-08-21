import PostsClient from "@/pages/projects/PostsClient";
import { getPublishedPostsServer } from "@/services/server/post.service";

export default async function Page() {
  let data = { content: [], number: 0, totalPages: 0 };

  try {
    data = await getPublishedPostsServer(0, 5);
  } catch (error) {
    console.error("SSR Post fetch hatası:", error);
  }

  return (
    <PostsClient
      initialPosts={data?.content || []}
      initialPage={data?.number ?? 0}
      totalPages={data?.totalPages ?? 0}
    />
  );
}
