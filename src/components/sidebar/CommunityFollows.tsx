"use client";

import { useEffect, useState } from "react";
import {
  followService,
  FollowDTO,
} from "@/services/client/follow/follow.service";
import { getFullImageUrl } from "@/utils/image";
import Link from "next/link";
import { FiUser } from "react-icons/fi";
import { GoChevronDown } from "react-icons/go";

interface CommunityFollowsProps {
  username: string; // Listelenecek kullanıcının username'i
}

export default function CommunityFollows({ username }: CommunityFollowsProps) {
  const [followingList, setFollowingList] = useState<FollowDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 8; // İlk yüklemede 8 tane çekiyoruz

  // İlk yükleme (Sayfa 0)
  useEffect(() => {
    const fetchInitialFollowing = async () => {
      if (!username) return;
      try {
        setIsLoading(true);
        const data = await followService.getFollowing(username, 0, PAGE_SIZE);

        // Backend'in yapısına göre (Spring Pageable objesi mi yoksa düz liste mi?)
        const list = Array.isArray(data) ? data : data.content || [];
        setFollowingList(list);

        // Eğer gelen veri boyutu PAGE_SIZE'dan küçükse başka sayfa kalmamıştır
        if (list.length < PAGE_SIZE || (data.last !== undefined && data.last)) {
          setHasMore(false);
        }
      } catch (err) {
        console.error("Takip edilenler yüklenirken hata:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialFollowing();
  }, [username]);

  // "Dahası" butonuna basıldığında bir sonraki sayfayı çekip listeye ekleme
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      const data = await followService.getFollowing(
        username,
        nextPage,
        PAGE_SIZE,
      );

      const newList = Array.isArray(data) ? data : data.content || [];

      if (newList.length > 0) {
        setFollowingList((prev) => [...prev, ...newList]);
        setPage(nextPage);
      }

      // Eğer gelen yeni liste boyutu istenen boyuttan azsa veya backend son sayfayı işaret ediyorsa bitir
      if (
        newList.length < PAGE_SIZE ||
        (data.last !== undefined && data.last)
      ) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Daha fazla takip edilen yüklenirken hata:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (isLoading) {
    return <div className="text-xs text-gray-400 py-2">Yükleniyor...</div>;
  }

  if (followingList.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        {followingList.map((user) => (
          <Link
            key={user.id}
            href={`/profil/${user.username}`}
            className="flex items-center gap-5"
            title={`${user.name} ${user.surname} (@${user.username})`}
          >
            <div className="relative w-5 h-5 rounded-full overflow-hidden border border-gray-200 hover:border-black transition-all shrink-0">
              {user.profileImg ? (
                <img
                  src={getFullImageUrl(user.profileImg)!}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <FiUser className="text-gray-400 text-xs" />
                </div>
              )}
            </div>
            <span className="text-xs text-gray-600 hover:text-black truncate">
              {user.name} {user.surname}
            </span>
          </Link>
        ))}

        {/* Daha fazla veri varsa 'Dahası' butonu gösterilir */}
        {hasMore && (
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="flex items-center gap-5 text-xs text-gray-600 hover:text-black cursor-pointer w-full text-left mt-1 disabled:opacity-50"
          >
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              <GoChevronDown className="text-lg" />
            </div>
            {isLoadingMore ? "Yükleniyor..." : "Dahası"}
          </button>
        )}
      </div>
    </div>
  );
}
