import { searchUsersClient } from "@/services/client/user/user.service";
import { PublicUser } from "@/context/UserContext";
import Link from "next/link";
import Image from "next/image";
import { FaRegUser } from "react-icons/fa6";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchUsersPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  let users: PublicUser[] = [];
  try {
    if (query) {
      users = await searchUsersClient(query);
    }
  } catch (error) {
    console.error("Kişiler aranamadı:", error);
  }

  if (!users || users.length === 0) {
    return (
      <p className="text-gray-500 text-sm">Bu kriterde kişi bulunamadı.</p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {users.map((u) => {
        const userProfileImgUrl = u.profileImg
          ? u.profileImg.startsWith("http")
            ? u.profileImg
            : `${baseUrl}/${u.profileImg}`
          : null;

        return (
          <Link
            key={u.id}
            href={`/profil/${u.username}`}
            className="p-4 border-b border-gray-100 transition-colors flex items-center gap-5 hover:bg-gray-50 rounded-lg"
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
            <div className="flex flex-col">
              <h2 className="text-base font-semibold text-gray-900">
                {u.name} {u.surname}
              </h2>
              {u.bio && (
                <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                  {u.bio}
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
