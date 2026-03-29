import { useRelativeTime } from "../../hooks/useRelativeTime";
import { useState } from "react";
import { useAuth } from "../../context/UserContext";
import { LuImages } from "react-icons/lu";
import { handleViewProject } from "../../utils/HandleViewProject";
import { useDeleteProject } from "@/hooks/projects/useDeleteProject";
import { useRouter } from "next/navigation";
import Image from "next/image";

const ProjectCardForProfile = ({ project, onDelete }) => {
  const { user } = useAuth();
  const { formatRelativeTime } = useRelativeTime();
  const route = useRouter();
  const { deleteProject } = useDeleteProject();
  const [showConfirm, setShowConfirm] = useState(false);
  // console.log("Project User:", project.user); // Debug için kaldırıldı

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
    if (project.user?.id !== user?.id) {
      alert("Bu projeyi silme yetkiniz yok!");
      return;
    } else {
      deleteProject(project.id, () => {
        // Silme işlemi başarılı olduğunda callback çağrılır
        if (onDelete && typeof onDelete === "function") {
          onDelete(project.id);
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
            project.image ? "" : "border border-gray-100 shadow-sm"
          }`}
        >
          {project.image ? (
            <Image
              src={project.image}
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
              {project.title}{" "}
            </h1>
          </div>
          <div className="text-xs text-[#6b6b6b] line-clamp-2">
            {(() => {
              const firstParagraph = project.content.find(
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
              {formatRelativeTime(project.createdAt)}{" "}
            </p>
            <button
              onClick={() =>
                handleViewProject(
                  project,
                  route,
                  project?.user?.name,
                  project?.title
                )
              }
              className="cursor-pointer text-xs text-gray-500 hover:text-gray-700 transition-all"
            >
              Projeyi İncele
            </button>
          </div>
          {user &&
            project.user?.role === "ADMIN" &&
            project.user?.id === user.id && (
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
          {user && project.user?.id === user?.id && (
            <>
              {showConfirm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-xs z-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col gap-4">
                    <span>Bu projeyi silmek istediğinize emin misiniz?</span>
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

export default ProjectCardForProfile;
