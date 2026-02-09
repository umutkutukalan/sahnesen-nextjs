"use client";
// import { useToProfile } from "../../hooks/useToProfile";
import { useRelativeTime } from "../../hooks/useRelativeTime";
import { FaStar, FaStarHalf } from "react-icons/fa";
import { handleViewBlog } from "../../utils/HandleViewBlog";

import { useRouter } from "next/navigation";
import Image from "next/image";

const PopularBlogs = ({ blogs }) => {
  const { formatRelativeTime } = useRelativeTime();
  const router = useRouter();
  // const { ToProfile } = useToProfile();
  console.log(blogs);
  const topBlogs = blogs.slice(0, 4);
  return (
    <div className="flex flex-col gap-4 mt-1">
      <div
        className="flex items-center gap-1"
        style={{
          fontSize: "0.8rem",
        }}
      >
        <FaStar className="flex-shrink-0 text-blue-600" />
        <h3>Popüler Bloglar</h3>
      </div>
      <ul className="flex flex-col gap-5">
        {topBlogs.map((blog) => (
          <li key={blog.id} className="flex flex-col gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div
                className="relative w-7 h-7 bg-gray-300 bg-gray-300 rounded-full overflow-hidden flex-shrink-0 cursor-pointer"
                // onClick={() => ToProfile(blog?.user, blog?.user?.username)}
              >
                <Image
                  src={blog.user.profileImg}
                  alt={blog.title}
                  fill
                  className="object-cover"
                />
              </div>
              <span
                className="cursor-pointer hover:underline"
                // onClick={() => ToProfile(blog?.user, blog?.user?.username)}
              >
                {blog.user.name} {blog.user.surname}
              </span>
            </div>
            <div
              className="flex flex-col gap-1 cursor-pointer"
              onClick={() =>
                handleViewBlog(blog, router, blog?.user.name, blog?.title)
              }
            >
              <span
                className="pr-10 line-clamp-2 font-semibold"
                style={{
                  fontSize: "0.8rem",
                }}
              >
                {blog.title}
              </span>
              <div className="flex items-center">
                <FaStarHalf className="flex-shrink-0 text-blue-600" />
                <span className="text-gray-500">
                  {formatRelativeTime(blog.createdAt)}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PopularBlogs;
