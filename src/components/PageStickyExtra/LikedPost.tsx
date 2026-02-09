"use client";
import { IoMdHeartEmpty } from "react-icons/io";
import { useUser } from "../../context/UserContext";
import { useRouter } from "next/navigation";
import { generateSlug } from "../../utils/GenerateSlug";

const LikedPost = ({ type }) => {
  const { user } = useUser();
  const router = useRouter();
  const handleViewLikedProjects = () => {
    if (user) {
      const username = user?.username;
      const usernameSlug = generateSlug(username);
      if (type === "projects") {
        router(`/liked-projects/@${usernameSlug}`);
      } else if (type === "blogs") {
        router(`/liked-blogs/@${usernameSlug}`);
      }
    }
  };
  return (
    <div
      className="flex items-center gap-2 cursor-pointer group transition-all"
      onClick={handleViewLikedProjects}
    >
      <div className="w-10 h-10 rounded-md overflow-hidden border border-gray-400 flex items-center justify-center text-gray-500 group-hover:border-gray-200 text-gray-700 transition-all">
        <IoMdHeartEmpty className="text-xl group-hover:text-red-500 group-hover:scale-110 transition-all duration-300" />
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-gray-600">
          Beğendiğin{" "}
          {type === "projects"
            ? "Çalışmalar"
            : type === "blogs"
              ? "Bloglar"
              : "Beğendiklerin"}
        </span>
        <span
          className="text-gray-400"
          style={{
            fontSize: "0.650rem",
          }}
        >
          Beğendiğiniz yazılara hızlıca ulaşın
        </span>
      </div>
    </div>
  );
};

export default LikedPost;
