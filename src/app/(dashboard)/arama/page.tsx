import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AramaRootPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";
  redirect(`/arama/posts?q=${encodeURIComponent(query)}`);
}
