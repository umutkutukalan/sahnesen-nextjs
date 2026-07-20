import { FiUser } from "react-icons/fi";
import { RiImageEditLine } from "react-icons/ri";
import { getOptimizedImageUrl } from "@/utils/ImageUtils";
import Image from "next/image";
import { profileborder } from "@/utils";
import { useEffect } from "react";
import { useGetUser } from "@/hooks/user/useGetUser";

const ProfileBorderImage = ({ usernameSlug }: { usernameSlug: string }) => {
  const { getUser, profileUser, isLoading } = useGetUser();

  useEffect(() => {
    if (usernameSlug) {
      getUser(usernameSlug);
    }
  }, [usernameSlug]);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  const currentProfileImg = profileUser?.profileImg;
  const currentCoverImg = profileUser?.coverImg;

  // Gelen string'in başında "/" yoksa, url birleştirirken çift slash olmaması için kontrol ediyoruz
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

  console.log("coverImageee", coverImgUrl);

  return (
    <div className="w-full aspect-[4.5] bg-gray-700 relative z-10">
      <div className="w-full h-full overflow-hidden group relative">
        {coverImgUrl ? (
          <div className="relative w-full h-full transition-transform duration-200 group-hover:scale-105">
            <Image
              src={coverImgUrl}
              alt="Kapak Resmi"
              fill
              quality={90}
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center relative">
            <div className="absolute inset-0 left-0 top-0 z-5">
              <Image
                src={profileborder}
                alt=""
                fill
                className="hover:scale-105 transition-transform duration-200 brightness-45 object-cover"
                style={{
                  imageRendering: "auto",
                }}
              />
            </div>
            <RiImageEditLine className="text-4xl text-gray-400 z-10" />
          </div>
        )}
      </div>
      <div className="absolute h-34 w-34 rounded-full overflow-hidden bg-gray-200 -bottom-10 left-20 shadow-lg z-20 flex items-center justify-center group transition-all">
        {profileImgUrl ? (
          <Image
            src={getOptimizedImageUrl(profileImgUrl)}
            alt=""
            fill
            className="hover:scale-105 transition-transform duration-200 object-cover"
            style={{
              imageRendering: "auto",
            }}
          />
        ) : (
          <FiUser className="text-7xl text-gray-500 group-hover:text-gray-300 transition-all" />
        )}
      </div>
    </div>
  );
};

export default ProfileBorderImage;
