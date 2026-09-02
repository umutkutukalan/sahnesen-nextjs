import { FiUser, FiUserCheck } from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";
import Image from "next/image";
import { useFollow } from "@/hooks/follow/useFollow";
import { getOptimizedImageUrl } from "@/utils/ImageUtils";
import { useToProfile } from "../../utils/useToProfile";
import { useAuth } from "@/context/UserContext";
import { FollowDTO } from "@/services/client/follow/follow.service";

interface FollowingItemProps {
  following: FollowDTO;
  setFollowingList: (isOpen: boolean) => void;
}

const FollowingItem = ({ following, setFollowingList }: FollowingItemProps) => {
  const { user } = useAuth();
  const { ToProfile } = useToProfile();

  const targetUsername = following?.username;
  const { isFollowing, isLoading, toggleFollow } = useFollow(targetUsername);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const targetProfileImgUrl = following?.profileImg
    ? following?.profileImg.startsWith("http")
      ? following?.profileImg
      : `${baseUrl}/${following?.profileImg}`
    : null;

  return (
    <li className="flex items-center gap-2 px-5 py-3">
      <div
        onClick={() => {
          ToProfile(targetUsername);
          setFollowingList(false);
        }}
        className="w-10 h-10 border border-gray-300 rounded-full overflow-hidden flex items-end justify-center cursor-pointer flex-shrink-0 relative"
      >
        {targetProfileImgUrl ? (
          <Image
            src={getOptimizedImageUrl(targetProfileImgUrl)}
            alt=""
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <FiUser className="text-3xl text-gray-500" />
        )}
      </div>
      <div className="w-full flex items-center justify-between">
        <div className="flex flex-col">
          <p className="text-gray-500" style={{ fontSize: "0.650rem" }}>
            @{targetUsername}
          </p>
          <span
            className="text-sm cursor-pointer"
            onClick={() => {
              ToProfile(targetUsername);
              setFollowingList(false);
            }}
          >
            {following?.name} {following?.surname}
          </span>
        </div>
        {user?.username !== targetUsername && (
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
                {isFollowing ? "Takipten Çıkılıyor..." : "Takip Ediliyor..."}
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
      </div>
    </li>
  );
};

export default FollowingItem;
