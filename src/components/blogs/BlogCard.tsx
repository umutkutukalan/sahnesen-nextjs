"use client";

import { FiUser } from "react-icons/fi";
import { LuImages } from "react-icons/lu";
import { CiHeart } from "react-icons/ci";
import { IoMdHeart } from "react-icons/io";
import { TbRosetteDiscountCheckFilled, TbRosetteFilled } from "react-icons/tb";
import { useEffect } from "react";
import Image from "next/image";
import { useRelativeTime } from "../../hooks/useRelativeTime";
import { useGetLikeCount } from "@/hooks/likes/useGetLikeCount";
import { useHasUserLiked } from "@/hooks/likes/useHasUserLiked";
import { handleViewBlog } from "@/utils/HandleViewBlog";
import { Blog } from "@/services/server/blog.service";
import { useToProfile } from "@/utils/useToProfile";
import { useRouter } from "next/navigation";
import { IoBook } from "react-icons/io5";

interface BlogCardProps {
    blog: Blog;
}

const BlogCard = ({ blog }: BlogCardProps) => {
    const { formatRelativeTime } = useRelativeTime();
    const router = useRouter();
    const { ToProfile } = useToProfile();
    const { hasUserLiked, liked } = useHasUserLiked();
    const { likeCount, getLikeCount } = useGetLikeCount();

    useEffect(() => {
        hasUserLiked(blog.id, "blog");
        getLikeCount(blog.id, "blog");
    }, [blog?.id]);

    const author = blog.user;

    console.log("BlogCard create user:", blog.postCreateUser);

    return (
        <div className="w-full lg:h-[240px] sm:h-[220px] h-[180px] border-b border-gray-200 text-black flex overflow-hidden select-none hover:shadow-lg hover:rounded-lg transition-all duration-300 ease-in-out gap-5 px-5">
            {/* LEFT IMAGE */}
            <div className="lg:w-1/5 sm:w-1/4 w-1/5 hidden rounded-lg flex-shrink-0 sm:flex items-center justify-center">
                <div
                    className={`relative w-full lg:h-50 sm:h-40 bg-white rounded-lg overflow-hidden flex items-center justify-center ${blog.image ? "" : "border border-gray-100 shadow-sm"
                        }`
                    }
                    style={{
                        boxShadow: "10px 10px 10px 0px rgba(0,0,0,0.5)"
                    }}
                >
                    {blog.image ? (
                        <Image
                            src={blog.image}
                            alt={blog.title}
                            fill
                            unoptimized
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <LuImages className="text-4xl text-gray-300" />
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT CONTENT */}
            <div className="lg:w-4/5 w-3/4 w-full h-full flex flex-col justify-between sm:px-4 lg:py-6 py-5">
                {/* AUTHOR */}
                <div className="flex items-center gap-2 cursor-pointer w-max"
                    onClick={() => {
                        if (blog?.user) {
                            ToProfile(blog?.user, blog.user?.username);
                        } else {
                            ToProfile(blog?.user, blog.user?.username);
                        }
                    }}
                >
                    <div className="relative w-8 h-8 rounded-full overflow-hidden shadow-lg shadow-black/20">
                        {author?.profileImg ? (
                            <Image
                                src={author.profileImg}
                                alt="avatar"
                                fill
                                unoptimized
                                className="object-cover"
                            />
                        ) : (
                            <FiUser className="w-full h-full p-1 text-gray-400" />
                        )}
                    </div>

                    <div className="truncate">
                        <div className="flex flex-col">
                            <div className="flex items-center">
                                <span className="truncate text-gray-600 text-xs">
                                    {author?.name || author?.email} {author?.surname}
                                </span>
                                <TbRosetteDiscountCheckFilled
                                    className="text-blue-500 scale-90 ml-1 shrink-0"
                                    title="Onaylı Yazar"
                                />
                                {/* <div className="relative ml-1 flex items-center justify-center">
                                    <TbRosetteFilled className="text-black scale-90 shrink-0 z-5"/>
                                    <IoBook className="absolute z-10 scale-30 text-white"/>
                                </div> */}
                            </div>
                            <span className="truncate text-[8px] text-gray-400">
                                @{author?.username}
                            </span>
                        </div>
                    </div>
                </div>

                {/* TITLE + CONTENT */}
                <div className="mt-2">
                    <h2 className="text-base sm:text-lg font-semibold line-clamp-2">
                        {blog.title}
                    </h2>

                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {blog.content.find((item) => item.type === "paragraph")?.value}
                    </p>
                </div>

                {/* FOOTER */}
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                        <span>{formatRelativeTime(blog.createdAt)}</span>

                        <div className="hidden sm:flex items-center gap-1">
                            {liked ? (
                                <IoMdHeart className="text-red-600 text-sm" />
                            ) : (
                                <CiHeart className="text-red-600 text-sm" />
                            )}
                            <span>
                                {likeCount >= 1000
                                    ? `${Math.floor(likeCount / 100) / 10}K`
                                    : likeCount}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() =>
                            handleViewBlog(
                                blog,
                                router,
                                author?.username,
                                blog.slug,
                            )
                        }
                        className="text-gray-600 hover:text-gray-900 transition cursor-pointer"
                    >
                        Okumaya Devam Et
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BlogCard;
