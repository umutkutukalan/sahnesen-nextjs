import { searchTagsClient } from "@/services/client/post.service";
import { TagResponse } from "@/services/client/tags/tag.service";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchTagsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";

  let tags: TagResponse[] = [];
  try {
    if (query) {
      tags = await searchTagsClient(query);
    }
  } catch (error) {
    console.error("Etiketler aranamadı:", error);
  }

  if (!tags || tags.length === 0) {
    return (
      <p className="text-gray-500 text-sm">Bu kriterde etiket bulunamadı.</p>
    );
  }

  return (
    <div className="flex items-center flex-wrap gap-4">
      {tags.map((tag) => (
        <Link key={tag.id} href={`/tag/${tag.name}`}>
          <div className="flex items-center gap-1 bg-gray-300 px-4 py-2 rounded-full">
            <div className="text-gray-600 font-serif text-lg">#</div>
            <div className="text-gray-900 text-sm">{tag.name}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
