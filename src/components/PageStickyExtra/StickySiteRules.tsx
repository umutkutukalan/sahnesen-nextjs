"use client";

import { useRouter } from "next/navigation";



const StickySiteRules = ({ user }) => {
  const router = useRouter();
  const handleViewProjectsBlogs = (type) => {
    if (type === "projects") {
      router.push(`/projeler`);
    } else if (type === "blogs") {
      router.push(`/bloglar`);
    }
  };
  return (
    <div
      className="flex items-center gap-2 text-gray-400 flex-wrap gap-y-0"
      style={{
        fontSize: "0.650rem",
      }}
    >
      <button className="cursor-pointer hover:text-gray-600 transition-all">
        Hakkımızda
      </button>
      <button className="cursor-pointer hover:text-gray-600 transition-all">
        Gizlilik Politikası
      </button>
      <button className="cursor-pointer hover:text-gray-600 transition-all">
        Kullanım Şartları
      </button>
      <button className="cursor-pointer hover:text-gray-600 transition-all">
        Yardım
      </button>
      <button className="cursor-pointer hover:text-gray-600 transition-all">
        Kurallar
      </button>
      <button
        className="cursor-pointer hover:text-gray-600 transition-all"
        onClick={() => handleViewProjectsBlogs("projects")}
      >
        Projeler
      </button>
      <button
        className="cursor-pointer hover:text-gray-600 transition-all"
        onClick={() => handleViewProjectsBlogs("blogs")}
      >
        Bloglar
      </button>
    </div>
  );
};

export default StickySiteRules;
