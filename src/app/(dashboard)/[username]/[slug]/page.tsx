// src/app/[username]/[slug]/page.tsx

import Detail from "@/components/detail/Detail";
import { getPostDetailServer } from "@/services/server/post.service"; // Güncel ortak servis
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    username: string;
    slug: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { username, slug } = await params;

  console.log("Sahnesen Motoru: İçerik yükleniyor...", { username, slug });

  // Backend'deki tekil Redis + viewCount destekli ortak endpoint'i tetikliyoruz
  const post = await getPostDetailServer(slug);

  // Eğer içerik bulunamadıysa veya URL'deki yazar ile içeriğin asıl yazarı uyuşmuyorsa güvenlik için 404
  if (!post || post.authorUsername !== username) {
    console.log(
      `İçerik bulunamadı veya yazar uyuşmazlığı: URL @${username} -> Gelen @${post?.authorUsername}`,
    );
    notFound(); // Next.js 404 sayfasına pürüzsüz geçiş
  }

  return <Detail post={post} />;
}
