import { useRelativeTime } from "../../hooks/useRelativeTime";
import { useState } from "react";
import { useAuth } from "../../context/UserContext";
import { LuImages } from "react-icons/lu";
import Image from "next/image";
import { handleViewBlog } from "@/utils/HandleViewBlog";
import { useDeleteBlog } from "@/hooks/blogs/useDeleteBlog";
import { useRouter } from "next/navigation";

const BlogCardForProfile = ({ blog, onDelete }) => {
  const { user } = useAuth();
  const { formatRelativeTime } = useRelativeTime();
  const route = useRouter();
  const { deleteBlog } = useDeleteBlog();
  const [showConfirm, setShowConfirm] = useState(false);

  const author = blog?.user;

  const handleDeleteClick = () => {
    if (!user) {
      alert("Bu işlem için giriş yapmalısınız!");
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (!user) {
      alert("Bu işlem için giriş yapmalısınız!");
      return;
    }
    if (blog.user?.id !== user?.id) {
      alert("Bu blog yazısını silme yetkiniz yok!");
      return;
    } else {
      deleteBlog(blog.id, () => {
        // Silme işlemi başarılı olduğunda callback çağrılır
        if (onDelete && typeof onDelete === "function") {
          onDelete(blog.id);
        }
      });
      setShowConfirm(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
  };

  return (
    <div className="w-full h-[180px] border-b border-gray-200 text-black flex overflow-hidden select-none hover:shadow-lg hover:rounded-lg transition-all duration-300 ease-in-out gap-2 px-5">
      <div className="w-1/6 h-full rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
        <div
          className={`w-full h-35 bg-white rounded-lg overflow-hidden flex items-center justify-center relative ${
            blog.image ? "" : "border border-gray-100 shadow-sm"
          }`}
        >
          {blog.image ? (
            <Image
              src={blog.image}
              alt="image"
              fill
              className="object-cover"
            />
          ) : (
            <LuImages className="text-5xl text-gray-300" />
          )}
        </div>
      </div>
      <div className="w-5/6 h-full flex flex-col justify-between px-4 py-5">
        <div className="flex flex-col gap-3">
          <div className="w-full flex items-center justify-between">
            <h1 className="text-xl font-semibold line-clamp-1">
              {" "}
              {blog.title}{" "}
            </h1>
          </div>
          <div className="text-xs text-[#6b6b6b] line-clamp-2">
            {(() => {
              const firstParagraph = blog.content.find(
                (item) => item.type === "paragraph"
              );
              return firstParagraph ? <p>{firstParagraph.value}</p> : null;
            })()}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-end gap-3">
            <p className="text-xs border-r pr-3 text-gray-500">
              {" "}
              {formatRelativeTime(blog.createdAt)}{" "}
            </p>
            <button
              onClick={() =>
                handleViewBlog(
                  blog,
                  route,
                  author?.username,
                  blog?.slug
                )
              }
              className="cursor-pointer text-xs text-gray-500 hover:text-gray-700 transition-all"
            >
              Okumaya Devam Et
            </button>
          </div>
          {user &&
            blog.user?.role === "ADMIN" &&
            blog.user?.id === user.id && (
              <div className="flex items-center">
                <button className="text-xs cursor-pointer text-green-800 border-r pr-2">
                  düzenle
                </button>
                <button
                  className="text-xs cursor-pointer text-red-800 pl-2"
                  onClick={handleDeleteClick}
                >
                  sil
                </button>
              </div>
            )}
          {/* Onay kutusu */}
          {user && blog.user?.id === user?.id && (
            <>
              {showConfirm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-xs z-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col gap-4">
                    <span>Bu blog yazısını silmek istediğinize emin misiniz?</span>
                    <div className="flex gap-3 justify-end">
                      <button
                        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
                        onClick={handleCancelDelete}
                      >
                        Vazgeç
                      </button>
                      <button
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
                        onClick={handleConfirmDelete}
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogCardForProfile;
