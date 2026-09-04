"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  searchPostsClient,
  searchTagsClient,
} from "@/services/client/post.service";
import { searchUsersClient } from "@/services/client/user/user.service";
import Link from "next/link";
import { IoIosPaper } from "react-icons/io";
import { FaRegUser } from "react-icons/fa6";
import Image from "next/image";

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const query = searchParams?.get("q") || "";

  const [posts, setPosts] = useState([]);
  const [tags, setTags] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "tags" | "users">(
    "posts",
  );

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  useEffect(() => {
    const fetchAllResults = async () => {
      if (!query) return;
      try {
        setLoading(true);
        const [postsData, tagsData, usersData] = await Promise.all([
          searchPostsClient(query),
          searchTagsClient(query),
          searchUsersClient(query),
        ]);
        setPosts(postsData || []);
        setTags(tagsData || []);
        setUsers(usersData || []);
      } catch (error) {
        console.error("Arama sonuçları getirilemedi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllResults();
  }, [query]);

  return (
    <div className="min-h-screen bg-white text-black pt-32 px-6 lg:px-40 max-w-5xl mx-auto">
      <h1 className="text-2xl font-serif font-bold mb-6">
        &quot;{query}&quot; için arama sonuçları
      </h1>

      {/* SEKME BUTONLARI (TABS) */}
      <div className="flex border-b border-gray-200 mb-8 gap-8">
        <button
          onClick={() => setActiveTab("posts")}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 cursor-pointer ${
            activeTab === "posts"
              ? "border-black text-black"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          Yazılar ({posts.length})
        </button>
        <button
          onClick={() => setActiveTab("tags")}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 cursor-pointer ${
            activeTab === "tags"
              ? "border-black text-black"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          Etiketler ({tags.length})
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 cursor-pointer ${
            activeTab === "users"
              ? "border-black text-black"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          Kişiler ({users.length})
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Aranıyor...</p>
      ) : (
        <div>
          {/* YAZILAR SEKMESİ */}
          {activeTab === "posts" &&
            (posts.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Bu kriterde yazı bulunamadı.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {posts.map((post: any) => (
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
            ))}

          {/* ETİKETLER SEKMESİ */}
          {activeTab === "tags" &&
            (tags.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Bu kriterde etiket bulunamadı.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {tags.map((tag: any) => (
                  <Link
                    key={tag.id}
                    href={`/tag/${tag.name}`}
                    className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-4"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 text-gray-600 font-serif text-lg">
                      #
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">
                        {tag.name}
                      </h2>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Konu / Etiket
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ))}

          {/* KİŞİLER SEKMESİ */}
          {activeTab === "users" &&
            (users.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Bu kriterde kişi bulunamadı.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {users.map((u: any) => {
                  const userProfileImgUrl = u.profileImg
                    ? u.profileImg.startsWith("http")
                      ? u.profileImg
                      : `${baseUrl}/${u.profileImg}`
                    : null;

                  return (
                    <Link
                      key={u.id}
                      href={`/profil/${u.username}`}
                      className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-4"
                    >
                      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200">
                        {userProfileImgUrl ? (
                          <Image
                            src={userProfileImgUrl}
                            alt={u.username}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <FaRegUser className="text-gray-500 text-lg" />
                        )}
                      </div>
                      <div>
                        <h2 className="text-base font-semibold text-gray-900">
                          {u.name} {u.surname}
                        </h2>
                        <p className="text-sm text-gray-500">@{u.username}</p>
                        {u.motto && (
                          <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                            {u.motto}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
