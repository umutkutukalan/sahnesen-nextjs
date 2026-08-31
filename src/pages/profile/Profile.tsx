"use client";

import { useEffect, useState } from "react";
import { FiUser, FiUserCheck } from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";
import { TbRosetteDiscountCheckFilled } from "react-icons/tb";
import {
  AiFillFacebook,
  AiFillGithub,
  AiFillInstagram,
  AiFillLinkedin,
  AiFillTwitterSquare,
  AiFillYoutube,
} from "react-icons/ai";
import { useAuth } from "@/context/UserContext";
import LoadingScreen from "@/components/LoadingScreen";
import { useRouter } from "next/navigation";
import { CiSettings } from "react-icons/ci";
import { BsBoxArrowUpRight } from "react-icons/bs";
import { getOptimizedImageUrl } from "../../utils/ImageUtils";
import Image from "next/image";
import { profilebg } from "@/utils";
import ProfileUserPosts from "./ProfileUserPosts";
import { useGetUser } from "@/hooks/user/useGetUser";
import { useGetFollowing } from "@/hooks/follow/useGetFollowing";
import { useGetFollowers } from "@/hooks/follow/useGetFollowers";
import { useFollow } from "@/hooks/follow/useFollow";
import FollowersList from "@/components/follow/FollowersList";
import FollowingList from "@/components/follow/FollowingList";
import { useSocialAccount } from "@/hooks/social_accounts/useSocialAccounts";
import PageAbout from "@/components/PageAbout";

const Profile = ({ usernameSlug }: { usernameSlug: string }) => {
  const { user } = useAuth();
  const router = useRouter();
  const currentUserId = user?.id;

  const [selectedPostType, setSelectedPostType] = useState<string | undefined>(
    undefined,
  );

  const [followingList, setFollowingList] = useState(false);
  const [followersList, setFollowersList] = useState(false);

  const { getUser, profileUser, isLoading } = useGetUser();

  const targetUsername = profileUser?.username;
  const targetUserId = profileUser?.id;
  const isOwnProfile = usernameSlug === user?.username;

  const { getPublicSocialAccounts, publicSocialAccounts } = useSocialAccount();
  const { isFollowing, followCounts, toggleFollow } = useFollow(targetUserId);
  const { getFollowing, followings } = useGetFollowing();
  const { getFollowers, followers } = useGetFollowers();

  useEffect(() => {
    if (usernameSlug) {
      getUser(usernameSlug);
    }
  }, [usernameSlug]);

  useEffect(() => {
    if (targetUsername) {
      getFollowing(targetUsername);
      getFollowers(targetUsername);
      getPublicSocialAccounts(targetUsername);
    }
  }, [targetUsername]);

  if (isLoading || !user) {
    return <LoadingScreen />;
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  const profileImgUrl = profileUser?.profileImg
    ? profileUser.profileImg.startsWith("http")
      ? profileUser.profileImg
      : `${baseUrl}/${profileUser.profileImg}`
    : null;

  const coverImgUrl = profileUser?.coverImg
    ? profileUser.coverImg.startsWith("http")
      ? profileUser.coverImg
      : `${baseUrl}/${profileUser.coverImg}`
    : null;

  return (
    <div className="min-h-screen">
      <div className="w-full">
        {/* Kapak Görseli */}
        <div className="w-full aspect-[5/1] bg-white relative z-20">
          <div className="w-full h-full overflow-hidden relative">
            {coverImgUrl ? (
              <Image
                src={getOptimizedImageUrl(coverImgUrl)}
                fill
                unoptimized
                alt="Cover"
                className="object-cover"
              />
            ) : (
              <Image
                src={profilebg}
                fill
                unoptimized
                alt="Cover"
                className="object-cover"
              />
            )}
          </div>
        </div>

        {/* Ana İçerik Konteyneri */}
        <div className="w-full px-4 md:px-8 lg:px-10">
          <div className="w-full flex gap-6 lg:gap-12 items-start">
            {/* SOL ALAN: Esnek Daralan Kısım */}
            <div className="flex-1 min-w-0 border-r border-gray-100 pr-4 lg:pr-8">
              <div className="w-full flex justify-center">
                <div className="w-full max-w-4xl flex flex-col transition-all duration-300">
                  {/* Filtreleme Başlıkları */}
                  <PageAbout
                    selectedType={selectedPostType}
                    onSelectType={(type) => setSelectedPostType(type)}
                  />

                  {/* Dinamik Gönderi Akışı */}
                  <div className="mt-6 w-full min-w-0">
                    {targetUsername && (
                      <ProfileUserPosts
                        targetUsername={targetUsername}
                        postType={selectedPostType}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SAĞ ALAN: Genişliği Korunan Sabit Kullanıcı Kartı */}
            <div
              className="w-64 lg:w-80 flex-shrink-0 sticky -mt-30 scrollbar-hide z-20 transition-all duration-200 overflow-y-auto"
              style={{ top: "50px", maxHeight: "100vh" }}
            >
              <div className="relative flex flex-col pt-10 pb-5">
                <div className="relative w-34 h-34 rounded-full overflow-hidden bg-gray-200 mb-4 flex items-center justify-center shadow-lg shadow-black/20 flex-shrink-0 border-3 border-white">
                  {profileImgUrl ? (
                    <Image
                      src={getOptimizedImageUrl(profileImgUrl)}
                      alt=""
                      fill
                      unoptimized
                      className="hover:scale-105 transition-transform duration-200 object-cover"
                    />
                  ) : (
                    <FiUser className="text-5xl text-gray-500" />
                  )}
                </div>

                <div className="flex flex-col my-1">
                  <h3 className="text-gray-500 text-xs">
                    @{profileUser?.username || "user"}
                  </h3>
                  <div className="flex items-center gap-1">
                    <h1 className="text-xl font-semibold">
                      {profileUser?.name} {profileUser?.surname}
                    </h1>
                    <TbRosetteDiscountCheckFilled
                      className="text-blue-500 text-xl"
                      title="Onaylı Yazar"
                    />
                  </div>
                </div>

                <div className="flex lg:flex-row flex-col lg:items-center gap-4 mt-2">
                  {isOwnProfile ? (
                    <button
                      onClick={() => router.push("/profil/me/settings")}
                      className="px-3 py-1 bg-gray-100 text-gray-700 flex items-center justify-center gap-1 border border-gray-300 rounded-sm text-xs cursor-pointer transition-colors hover:bg-gray-200"
                    >
                      <CiSettings className="text-sm" />
                      <span>Sahneni Düzenle</span>
                    </button>
                  ) : (
                    <button
                      onClick={toggleFollow}
                      disabled={isLoading}
                      className={`px-3 py-1 flex items-center justify-center gap-1 border border-gray-300 rounded-sm text-xs cursor-pointer transition-colors hover:bg-gray-50 disabled:opacity-50 ${
                        isFollowing
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-white text-green-700 border-gray-300"
                      }`}
                    >
                      {isFollowing ? (
                        <div className="flex items-center gap-1">
                          <FiUserCheck />
                          <span className="text-blue-700">Takiptesin</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <IoIosArrowDown className="text-green-700" />
                          <span className="text-green-700">Takip Et</span>
                        </div>
                      )}
                    </button>
                  )}

                  <div className="flex items-center gap-2 text-xs">
                    <div
                      className="flex items-center gap-1 cursor-pointer"
                      onClick={() => setFollowersList(!followersList)}
                    >
                      <span>{followCounts?.followerCount || 0}</span>
                      <span className="text-gray-700">Takipçi</span>
                    </div>
                    <span className="text-gray-600">•</span>
                    <div
                      className="flex items-center gap-1 cursor-pointer"
                      onClick={() => setFollowingList(!followingList)}
                    >
                      <span>{followCounts?.followingCount || 0}</span>
                      <span className="text-gray-700">Takip</span>
                    </div>
                  </div>
                </div>

                {/* <div
                  className="flex flex-col gap-1 mt-5 text-gray-600"
                  style={{ fontSize: "0.7rem" }}
                >
                  <div className="flex items-center gap-1">
                    <MdOutlineWorkspacePremium className="text-xl" />
                    <span>Klinik Psikolog</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TiLocationArrow className="text-xl" />
                    <span>Eskişehir, Türkiye</span>
                  </div>
                </div> */}

                <div
                  className="mt-5 flex flex-col gap-1 border-l border-gray-400 pl-2 text-gray-600"
                  style={{ fontSize: "0.7rem" }}
                >
                  <p>{profileUser?.bio || "Biyografi alanı doldurulmadı."}</p>
                </div>

                {publicSocialAccounts.length > 0 && (
                  <div className="mt-5 flex flex-col gap-1">
                    <h3 className="text-gray-600 text-xs">Bağlantılar</h3>
                    {publicSocialAccounts.map((account) => (
                      <ul
                        key={account?.id}
                        className="flex flex-col gap-2 text-xs text-gray-600"
                      >
                        <a
                          href={account?.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="border border-gray-400 py-2 px-4 rounded-md cursor-pointer hover:text-black transition-all w-full flex items-center justify-between mt-1"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full overflow-hidden">
                              {account.platform === "INSTAGRAM" && (
                                <AiFillInstagram className="w-full h-full" />
                              )}
                              {account.platform === "FACEBOOK" && (
                                <AiFillFacebook className="w-full h-full" />
                              )}
                              {account.platform === "YOUTUBE" && (
                                <AiFillYoutube className="w-full h-full" />
                              )}
                              {account.platform === "TWITTER" && (
                                <AiFillTwitterSquare className="w-full h-full" />
                              )}
                              {account.platform === "LINKEDIN" && (
                                <AiFillLinkedin className="w-full h-full" />
                              )}
                              {account.platform === "GITHUB" && (
                                <AiFillGithub className="w-full h-full" />
                              )}
                            </div>
                            <span className="font-medium">
                              {account?.platform}
                            </span>
                          </div>
                          <BsBoxArrowUpRight />
                        </a>
                      </ul>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Takipçi / Takip Edilen Modalları */}
      <div className="mt-6">
        {followingList && (
          <FollowingList
            followings={followings}
            currentUserId={currentUserId}
            onClose={() => setFollowingList(false)}
            setFollowingList={setFollowingList}
          />
        )}
        {followersList && (
          <FollowersList
            followers={followers}
            currentUserId={currentUserId}
            onClose={() => setFollowersList(false)}
            setFollowersList={setFollowersList}
          />
        )}
      </div>
    </div>
  );
};

export default Profile;
