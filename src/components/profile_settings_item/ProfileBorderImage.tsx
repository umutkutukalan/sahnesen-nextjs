import { FiUser } from "react-icons/fi";
import { RiImageEditLine } from "react-icons/ri";
import { getOptimizedImageUrl } from "@/utils/ImageUtils";
import Image from "next/image";
import { profileborder } from "@/utils";

const ProfileBorderImage = ({ user }) => {
  return (
    <div className="w-full h-70 bg-gray-700 relative z-10">
      <div className="w-full h-full overflow-hidden group relative">
        {user?.profileBorder ? (
          <Image
            src={getOptimizedImageUrl(user.profileBorder)} // Artık direkt base64 string
            alt=""
            fill
            className="hover:scale-105 transition-transform duration-200 object-cover"
            style={{
              imageRendering: "auto",
            }}
          />
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
      <div className="absolute h-30 w-30 rounded-full overflow-hidden bg-gray-200 -bottom-10 left-20 shadow-lg z-20 flex items-center justify-center group transition-all">
        {user?.profileImg ? (
          <Image
            src={getOptimizedImageUrl(user.profileImg)} // Artık direkt base64 string
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
