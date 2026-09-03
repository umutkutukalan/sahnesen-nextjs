"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { searchPostsClient } from "@/services/client/post.service";
import Link from "next/link";
import { IoIosPaper } from "react-icons/io";

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const query = searchParams?.get("q") || "";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      try {
        setLoading(true);
        const data = await searchPostsClient(query);
        setResults(data || []);
      } catch (error) {
        console.error("Arama sonuçları getirilemedi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div className="min-h-screen bg-white text-black pt-32 px-6 lg:px-40 max-w-5xl mx-auto">
      <h1 className="text-2xl font-serif font-bold mb-6">
        &quot;{query}&quot; için arama sonuçları
      </h1>

      {loading ? (
        <p className="text-gray-400 text-sm">Aranıyor...</p>
      ) : results.length === 0 ? (
        <p className="text-gray-500 text-sm">
          Bu arama kriterine uygun sonuç bulunamadı.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {results.map((post: any) => (
            <Link
              key={post.id}
              href={`/${post.authorUsername}/${post.slug}`}
              className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors flex items-start gap-4"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 mt-1">
                <IoIosPaper className="text-gray-500 text-lg" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  {post.title}
                </h2>
                <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                  {post.subtitle}
                </p>
                <span className="text-xs text-gray-400 mt-2 block">
                  @{post.authorUsername}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
