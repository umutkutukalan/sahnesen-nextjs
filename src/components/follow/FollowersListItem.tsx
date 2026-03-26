
import { FiUser, FiUserCheck } from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";
import Image from "next/image";
import { useToProfile } from "@/utils/useToProfile";
import { getOptimizedImageUrl } from "@/utils/ImageUtils";
import { useFollow } from "@/hooks/follow/useFollow";

const FollowersListItem = ({ follower, currentUserId, setFollowersList }) => {
  const { ToProfile } = useToProfile();
  const { isFollowing, isLoading, toggleFollow } = useFollow(
    follower.follower.id
  );

  return (
    <li className="flex items-center gap-2 px-5 py-3">
      <div
        onClick={() => {
          ToProfile(follower?.follower, follower?.follower?.username);
          setFollowersList(false);
        }}
        className="w-10 h-10 border border-gray-300 rounded-full overflow-hidden flex items-end justify-center cursor-pointer flex-shrink-0 relative"
      >
        {follower.follower.profileImg ? (
          <Image
            src={getOptimizedImageUrl(follower.follower.profileImg)}
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
            @{follower.follower.username}
          </p>
          <span className="text-sm cursor-pointer" onClick={() => ToProfile()}>
            {follower.follower.name} {follower.follower.surname}
          </span>
        </div>
        {/* Sadece takip butonu - kendi kendini takip edemez */}
        {follower.follower.id !== currentUserId && (
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

export default FollowersListItem;
