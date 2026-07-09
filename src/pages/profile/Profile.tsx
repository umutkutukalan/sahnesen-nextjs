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
import { getOptimizedImageUrl } from "../../utils/ImageUtils"; // Özel karakterleri kaldırmak için yardımcı fonksiyon
import Image from "next/image";
import { duck2, duck3, duck4, duck5, duck7, profileborder } from "@/utils";
import ProfileUserProjects from "./ProfileUserProject";
import { useGetUser } from "@/hooks/user/useGetUser";
import { useGetFollowing } from "@/hooks/follow/useGetFollowing";
import { useGetFollowers } from "@/hooks/follow/useGetFollowers";
import { useFollow } from "@/hooks/follow/useFollow";
import FollowersList from "@/components/follow/FollowersList";
import FollowingList from "@/components/follow/FollowingList";
import { useSocialAccount } from "@/hooks/social_accounts/useSocialAccounts";
import ProfileUserBlogs from "./ProfileUserBlogs";
import { MdOutlineWorkspacePremium } from "react-icons/md";
import { TiLocationArrow } from "react-icons/ti";
import { profile } from "console";

const Profile = ({ usernameSlug }: { usernameSlug: string }) => {
  const { user } = useAuth();
  const router = useRouter();
  const currentUserId = user?.id; // Giriş yapan kullanıcının ID'si

  const rozets = [
    // { id: 1, rozet: quickdraw, name: "Hızlı Çizer" },
    // { id: 2, rozet: pullshark, name: "Pull Shark" },
    // { id: 3, rozet: yolo, name: "YOLO" },
    { id: 4, rozet: duck2, name: "Duck 2" },
    { id: 5, rozet: duck3, name: "Duck 3" },
    { id: 6, rozet: duck4, name: "Duck 4" },
    { id: 7, rozet: duck5, name: "Duck 5" },
    { id: 8, rozet: duck7, name: "Duck 7" },
  ];

  const [activeTab, setActiveTab] = useState("projeler"); // Tab state'i
  const [followingList, setFollowingList] = useState(false);
  const [followersList, setFollowersList] = useState(false);

  // username varsa getUser'da username ile bulacağız
  const { getUser, profileUser, isLoading } = useGetUser();

  // Eğer URL'de id varsa onu kullan, yoksa username kullan, hiçbiri yoksa giriş yapan kullanıcının profilini göster

  console.log("ProfileUser in Profile component:", profileUser);

  const targetUserId = profileUser?.id;
  // kendi profili mi kontrolü — artık id state'i yok, username ile karşılaştır
  const isOwnProfile = usernameSlug === user?.username;

  const { getPublicSocialAccounts, publicSocialAccounts } =
    useSocialAccount(targetUserId);

  const { isFollowing, followCounts, toggleFollow } = useFollow(targetUserId);
  const { getFollowing, followings } = useGetFollowing();
  const { getFollowers, followers } = useGetFollowers();

  useEffect(() => {
    if (usernameSlug) {
      getUser(usernameSlug); // hook'un username desteklediğini varsayarak
    }
  }, [usernameSlug]);

  useEffect(() => {
    if (targetUserId) {
      getFollowing(targetUserId);
    }
  }, [targetUserId, getFollowing]);

  useEffect(() => {
    if (targetUserId) {
      getFollowers(targetUserId);
    }
  }, [targetUserId, getFollowers]);

  useEffect(() => {
    if (targetUserId) {
      console.log("Fetching social accounts for ID:", targetUserId);
      getPublicSocialAccounts(targetUserId);
    }
  }, [targetUserId]);
  console.log("Social Accounts:", publicSocialAccounts);
  console.log("Followings:", followings);
  console.log("Followers:", followers);

  if (isLoading || !user) {
    return <LoadingScreen />;
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  // Gelen string'in başında "/" yoksa, url birleştirirken çift slash olmaması için kontrol ediyoruz
  const profileImgUrl = profileUser?.profileImg
    ? profileUser.profileImg.startsWith("http")
      ? profileUser.profileImg
      : `${baseUrl}/${profileUser.profileImg}`
    : null;

  return (
    <div className="min-h-screen">
      <div className="w-full">
        <div className="w-full">
          {/* Profil resmi ve bilgileri */}
          <div className="w-full h-80 bg-gray-700 relative z-10">
            <div className="w-full h-full overflow-hidden relative">
              <div className="absolute inset-0"></div>
              <div>
                <Image
                  src={
                    getOptimizedImageUrl(profileUser?.profileBorder) ||
                    profileborder
                  }
                  fill
                  unoptimized
                  alt=""
                  className="object-cover"
                />
              </div>
            </div>
            <div className="absolute h-35 w-35 rounded-full overflow-hidden bg-gray-200 -bottom-15 left-10 z-20 flex items-center justify-center shadow-lg shadow-black/20">
              {profileImgUrl ? (
                <Image
                  src={getOptimizedImageUrl(profileImgUrl)}
                  alt=""
                  fill
                  unoptimized
                  className="hover:scale-105 transition-transform duration-200 object-cover"
                  style={{
                    imageRendering: "auto",
                  }}
                />
              ) : (
                <FiUser className="text-7xl text-gray-500" />
              )}
            </div>
          </div>
          <div className="mt-10 px-10 w-full flex gap-10">
            {/* Kullanıcı adı ve takip butonu */}
            <div
              className="w-1/4 mt-12"
              style={{ position: "sticky", top: "64px" }}
            >
              <div className="flex flex-col">
                {rozets.length > 0 && (
                  <ul className="flex items-center gap-0.5 mb-2">
                    {rozets.map((rozet) => (
                      <li key={rozet?.id}>
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center border border-1 border-gray-600 overflow-hidden relative">
                            <Image
                              src={rozet?.rozet}
                              alt={rozet?.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          {rozet.id === 5 && (
                            <div className="absolute -top-1 right-0 w-3 h-3 rounded-full bg-orange-500 text-[7px] flex items-center justify-center text-white">
                              x2
                            </div>
                          )}
                          {rozet.id === 4 && (
                            <div className="absolute -top-1 right-0 w-3 h-3 rounded-full bg-black text-[7px] flex items-center justify-center text-white">
                              x3
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
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
                <div className="flex items-center gap-4 mt-2">
                  {/* Kendi profilinde düzenle butonu, başkasının profilinde takip butonu */}
                  {isOwnProfile ? (
                    // Kendi profili - Düzenle butonu
                    <button
                      onClick={() => router.push("/profile/me/settings")}
                      className="px-3 py-1 bg-gray-100 text-gray-700 flex items-center justify-center gap-1 border border-gray-300 rounded-sm text-xs cursor-pointer transition-colors hover:bg-gray-200"
                    >
                      <CiSettings className="text-sm" />
                      <span>Profili Düzenle</span>
                    </button>
                  ) : (
                    // Başkasının profili - Takip butonu
                    <button
                      onClick={toggleFollow}
                      disabled={isLoading}
                      className={`px-3 py-1 flex items-center justify-center gap-1 border border-gray-300 rounded-sm text-xs cursor-pointer transition-colors hover:bg-gray-50 disabled:opacity-50 ${
                        isFollowing
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-white text-green-700 border-gray-300"
                      }`}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                          {isFollowing
                            ? "Takipten Çıkılıyor..."
                            : "Takip Ediliyor..."}
                        </div>
                      ) : isFollowing ? (
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
                  {/* Takip/Takipçi sayıları */}
                  <div className="flex text-xs">
                    <div
                      className="flex items-center gap-1 border-r pr-2 border-gray-400 cursor-pointer"
                      onClick={() => setFollowersList(!followersList)}
                    >
                      <span>{followCounts?.followerCount || 0}</span>
                      <span className="text-gray-700">Takipçi</span>
                    </div>
                    <div
                      className="flex items-center gap-1 pl-2 cursor-pointer"
                      onClick={() => setFollowingList(!followingList)}
                    >
                      <span>{followCounts?.followingCount || 0}</span>
                      <span className="text-gray-700">Takip</span>
                    </div>
                  </div>
                </div>
                <div
                  className="flex flex-col gap-1 mt-5 text-gray-600"
                  style={{ fontSize: "0.7rem" }}
                >
                  <div className="flex items-center gap-1">
                    <MdOutlineWorkspacePremium className="text-xl" />
                    <span>Yazılım Mühendisi</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TiLocationArrow className="text-xl" />
                    <span>Eskişehir, Türkiye</span>
                  </div>
                </div>
                {profileUser?.bio ? (
                  <div
                    className="mt-5 flex flex-col gap-1 border-l border-gray-400 pl-2 text-gray-600"
                    style={{
                      fontSize: "0.7rem",
                    }}
                  >
                    <p>{profileUser?.bio}</p>
                  </div>
                ) : (
                  <div
                    className="mt-5 flex flex-col gap-1 border-l border-gray-400 pl-2 text-gray-600"
                    style={{
                      fontSize: "0.7rem",
                    }}
                  >
                    <span> Biyografi alanı doldurulmadı. </span>
                  </div>
                )}

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
                          className="border border-gray-400 py-2 px-4 rounded-md cursor-pointer hover:text-black transition-all w-full flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full overflow-hidden">
                              {account.platform === "Instagram" && (
                                <AiFillInstagram className="w-full h-full object-cover" />
                              )}
                              {account.platform === "Facebook" && (
                                <AiFillFacebook className="w-full h-full object-cover" />
                              )}
                              {account.platform === "YouTube" && (
                                <AiFillYoutube className="w-full h-full object-cover" />
                              )}
                              {account.platform === "Twitter" && (
                                <AiFillTwitterSquare className="w-full h-full object-cover" />
                              )}
                              {account.platform === "LinkedIn" && (
                                <AiFillLinkedin className="w-full h-full object-cover" />
                              )}
                              {account.platform === "Github" && (
                                <AiFillGithub className="w-full h-full object-cover" />
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
            <div className="w-3/4">
              {/* Tab Navigation */}
              <div className="flex gap-8 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("projeler")}
                  className={`pb-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                    activeTab === "projeler"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Projeler
                </button>
                <button
                  onClick={() => setActiveTab("bloglar")}
                  className={`pb-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                    activeTab === "bloglar"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Bloglar
                </button>
                <button
                  onClick={() => setActiveTab("kitaplık")}
                  className={`pb-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                    activeTab === "kitaplık"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Kitaplık
                </button>
              </div>

              {/* Tab Content */}
              <div className="mt-6">
                {activeTab === "projeler" && (
                  <ProfileUserProjects targetUserId={targetUserId} />
                )}
                {activeTab === "bloglar" && (
                  <ProfileUserBlogs targetUserId={targetUserId} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Takipçi ve takip eden listeleri */}
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
