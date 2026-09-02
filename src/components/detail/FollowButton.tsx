import { useAuth } from "@/context/UserContext";
import { MdCheck } from "react-icons/md";
import { IoIosArrowDown } from "react-icons/io";
import { useFollow } from "@/hooks/follow/useFollow";

interface FollowButtonProps {
  username: string;
  className?: string;
}

const FollowButton = ({ username, className = "" }: FollowButtonProps) => {
  const { user } = useAuth();
  const { isFollowing, isLoading, toggleFollow, canFollow } =
    useFollow(username);

  // Kendi profilindeyse veya giriş yapılmamışsa gösterme
  if (!canFollow || !user) {
    return null;
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <button
        onClick={toggleFollow}
        disabled={isLoading}
        style={{ fontSize: "11px" }}
        className={`font-medium rounded-sm transition-colors cursor-pointer flex items-center justify-center gap-1 ${
          isFollowing ? "text-gray-700" : "text-black"
        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""} disabled:opacity-50`}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
            {isFollowing ? "Takipten Çıkılıyor..." : "Takip Ediliyor..."}
          </div>
        ) : isFollowing ? (
          <>
            <span className="text-blue-700">Takiptesin</span>
            <MdCheck className="text-blue-700" />
          </>
        ) : (
          <>
            <IoIosArrowDown className="text-green-700" />
            <span className="text-green-700">Takip Et</span>
          </>
        )}
      </button>
    </div>
  );
};

export default FollowButton;
