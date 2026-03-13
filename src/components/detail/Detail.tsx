"use client";

import { useRelativeTime } from "@/hooks/useRelativeTime";
import { Project } from "@/services/server/project.service";
import { useEffect, useState } from "react";
import { BiCommentDetail } from "react-icons/bi";
import LoadingScreen from "../LoadingScreen";
import { FiUser } from "react-icons/fi";
import { TbRosetteDiscountCheckFilled } from "react-icons/tb";
import { IoIosMore, IoMdHeart } from "react-icons/io";
import FollowButton from "./FollowButton";
import { usePostLike } from "@/hooks/like/usePostLike";
import { useUnlikedPost } from "@/hooks/like/useUnlikedPost";
import { useGetLikeCount } from "@/hooks/likes/useGetLikeCount";
import { useHasUserLiked } from "@/hooks/likes/useHasUserLiked";
import Image from "next/image";
import { Blog } from "@/services/server/blog.service";

interface DetailProps {
  project?: Project;
  blog?: Blog;
}

const Detail = ({ project }: DetailProps) => {
  const postId = project?.id;
  const [type, setType] = useState(project ? "project" : "blog");
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  // const { ToProfile } = useToProfile();
  const { formatRelativeTime } = useRelativeTime();
  const { likedPost } = usePostLike();
  const { hasUserLiked, liked, isLoading } = useHasUserLiked();
  const [likedLocal, setLikedLocal] = useState<null | boolean>(liked);
  const { unlikedPost } = useUnlikedPost();
  const { likeCount, getLikeCount } = useGetLikeCount();
  const [likeCountLocal, setLikeCountLocal] = useState(likeCount);

  const user = project?.user;

  const toggleComments = () => {
    setIsCommentsOpen(!isCommentsOpen);
  };

  // Örnek yorum verileri - gerçek tarihlerle
  const sampleComments = [
    {
      id: 1,
      username: "ahmet_dev",
      avatar: "A",
      avatarColor: "from-blue-500 to-purple-500",
      comment:
        "Çok güzel anlatmışsın! Bu konuyu araştırıyordum tam zamanında geldi 🚀",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 saat önce
    },
  ];

  useEffect(() => {
    setLikedLocal(liked);
  }, [liked]);
  useEffect(() => {
    setLikeCountLocal(likeCount);
  }, [likeCount]);

  useEffect(() => {
    hasUserLiked(postId, type);
    getLikeCount(postId, type);
  }, [postId, type]);

  const checkedLikeBtn = () => {
    if (likedLocal) {
      setLikedLocal(false);
      setLikeCountLocal((prev) => prev - 1);
      unlikedPost(postId, type);
    } else {
      setLikedLocal(true);
      setLikeCountLocal((prev) => prev + 1);
      likedPost(postId, type);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="page pt-5">
      <div
        className={`page-padding flex gap-5 relative ${
          !isCommentsOpen && "items-center justify-center"
        }`}
      >
        {/* Ana İçerik */}
        <div
          className={`flex flex-col w-240 gap-10 transition-all duration-300 relative`}
        >
          <div className="flex flex-col">
            <div className="w-full flex items-center justify-between border-b pb-5 border-gray-200">
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200 cursor-pointer flex items-end justify-center"
                    // onClick={() => ToProfile(project.user, project.user?.username)}
                  >
                    {user?.profileImg ? (
                      <Image
                        src={user.profileImg}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <FiUser className="text-2xl text-gray-500" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <span
                        className="text-xs text-gray-700 cursor-pointer font-medium"
                        // onClick={() => ToProfile(user, user?.username)}
                      >
                        {user?.name} {user?.surname}
                      </span>
                      <TbRosetteDiscountCheckFilled
                        className="text-blue-500"
                        title="Onaylı Yazar"
                      />
                    </div>
                    {/* Takip butonu ve sayılar */}
                    {user?.id && <FollowButton userId={user.id} className="" />}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 border-b py-4 border-gray-200">
              <h1 className="text-4xl font-bold">{project?.title}</h1>
              <div className="flex items-center gap-2 text-xs text-gray-500 select-none">
                <p>10 min read</p>
                <span>•</span>
                <p>{formatRelativeTime(project?.createdAt)} </p>
              </div>
            </div>
            <div className="h-full w-full flex items-center py-2 justify-between border-b border-gray-200">
              <div className="h-full flex items-center gap-0.5 text-gray-500">
                <IoMdHeart
                  className={`text-2xl cursor-pointer ${
                    likedLocal ? "text-red-500" : ""
                  }`}
                  onClick={() => checkedLikeBtn()}
                />
                <span className="text-sm">
                  {likeCountLocal >= 1000
                    ? (likeCountLocal % 1000 === 0
                        ? (likeCountLocal / 1000).toFixed(0)
                        : Math.floor(likeCountLocal / 100) / 10) + "K"
                    : likeCountLocal}{" "}
                </span>
              </div>
              <div className="flex items-center gap-3 h-full">
                <div className="flex items-center gap-1 h-full text-xs">
                  <div className="w-15 h-full rounded-md border border-gray-500 flex items-center justify-center gap-1 cursor-pointer">
                    <span>#kitap</span>
                  </div>
                  <div className="w-15 h-full rounded-md border border-gray-500 flex items-center justify-center gap-1 cursor-pointer">
                    <span>#haber</span>
                  </div>
                </div>
                <IoIosMore className="text-2xl cursor-pointer" />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {project?.content.map((item, index) => {
              if (item.type === "paragraph") {
                return (
                  <p key={index} className="text-gray-700 text-lg mb-5">
                    {item.value}
                  </p>
                );
              }
              if (item.type === "image") {
                return (
                  <div className="relative h-150" key={index}>
                    <Image
                      src={item.value}
                      alt={`contentType-img-${index}`}
                      fill
                      className="mb-5 object-cover"
                    />
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
        {/* Yorumlar Toggle Butonu */}
        <button
          onClick={toggleComments}
          className={`fixed bottom-0 right-0 -translate-y-1/2 -translate-x-1/2 flex items-center gap-1 rounded-lg transition-all duration-200 border border-gray-200 px-2 py-1 cursor-pointer ${
            isCommentsOpen
              ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
              : "text-gray-600 border-gray-200 hover:text-gray-800 hover:bg-gray-50 bg-white"
          }`}
        >
          <BiCommentDetail className="text-xs" />
          <span className="text-xs text-gray-500 rounded-full">
            {sampleComments.length}
          </span>
        </button>

        {/* Yorumlar Paneli - Sadece açıkken göster */}
        {/* {isCommentsOpen && (
          <div
            className="w-1/3 h-full pl-5 transition-all duration-300"
            style={{ position: "sticky", top: "80px" }}
          >
            <CommentSection initialComments={sampleComments} title="Yorumlar" />
          </div>
        )} */}
      </div>
    </div>
  );
};

export default Detail;
