"use client";

import { FaCheck } from "react-icons/fa";
import { useState } from "react";
import { MdNavigateNext } from "react-icons/md";

export interface CreateIntroProps {
  setResourceType: "projects" | "blogs";
}

export const CreateIntro = ({ setResourceType }: CreateIntroProps) => {
  const [currentResourceType, setCurrentResourceType] = useState<
    "projects" | "blogs"
  >("projects");

  const selectedType = currentResourceType || "projects";

  return (
    <div className={`page h-[100vh]`}>
      <div className="flex h-full">
        <div className="absolute inset-0 bg-black opacity-50 z-10"></div>
        <div
          className="absolute inset-0 top-0 left-0"
          style={{
            boxShadow: "5px 10px 15px 5px rgba(0, 0, 0, 0.2)",
          }}
        >
          <div className="absolute inset-0 bg-black opacity-20"></div>
          {/* <Image src={selectedImage} alt="" fill className="object-cover" /> */}
        </div>
        <div className="w-full h-full flex items-center justify-center z-20 px-5">
          <div className="w-1/2 h-full p-10 z-50">
            <div className="h-full flex flex-col justify-between gap-20">
              <div className="flex flex-col h-full">
                <div className="flex flex-col gap-4 h-full justify-between">
                  {["projects", "blogs"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setCurrentResourceType(type)}
                      className={`w-full h-full p-5 rounded-xl cursor-pointer transition-all duration-500 shadow-md ${
                        currentResourceType === type
                          ? "bg-gray-300"
                          : "bg-white text-gray-800"
                      } focus:outline-none`}
                    >
                      {type === "projects" ? (
                        <SelectType
                          type="projects"
                          currentResourceType={currentResourceType}
                        />
                      ) : (
                        <SelectType
                          type="blogs"
                          currentResourceType={currentResourceType}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              {currentResourceType && (
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => setResourceType(currentResourceType)}
                    disabled={!currentResourceType}
                    className="flex items-center gap-1 text-white hover:text-sm transition-all duration-200 px-4 py-2 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Başla
                    <MdNavigateNext className="text-2xl" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SelectType = ({ type, currentResourceType }) => {
  return (
    <>
      {type === "projects" && (
        <div className="flex items-center gap-5 text-left h-full">
          <div
            className={`w-16 h-16 flex-shrink-0 rounded-full overflow-hidden border border-gray-300 flex items-center justify-center ${
              currentResourceType === "projects"
                ? "bg-green-800 transition-all duration-500 border-none"
                : "transition-all duration-500"
            }`}
          >
            {currentResourceType === "projects" && (
              <FaCheck className="text-white text-2xl" />
            )}
          </div>
          <div className="flex flex-col items-start gap-1">
            <h4 className="text-2xl">Projeni Anlat</h4>
            <p className="text-sm">
              Yaptığın yazılım, tasarım veya sanat projelerini paylaş, ilham ver
              ve kendini tanıt.
            </p>
          </div>
        </div>
      )}

      {type === "blogs" && (
        <div className="flex items-center gap-5 text-left h-full">
          <div
            className={`w-16 h-16 flex-shrink-0 rounded-full overflow-hidden border border-gray-300 flex items-center justify-center ${
              currentResourceType === "blogs"
                ? "bg-green-800 transition-all duration-500 border-none"
                : "transition-all duration-500"
            }`}
          >
            {currentResourceType === "blogs" && (
              <FaCheck className="text-white text-2xl" />
            )}
          </div>
          <div className="flex flex-col items-start gap-1">
            <h4 className="text-2xl">Blog Oluştur</h4>
            <p className="text-sm">
              Düşüncelerini, deneyimlerini veya öğrendiklerini yazıya dök; kendi
              dijital günlüğünü başlat.
            </p>
          </div>
        </div>
      )}

      {type === "musics" && (
        <div className="flex items-center gap-5 text-left h-full">
          <div
            className={`w-16 h-16 flex-shrink-0 rounded-full overflow-hidden border border-gray-300 flex items-center justify-center ${
              currentResourceType === "musics"
                ? "bg-green-800 transition-all duration-500 border-none"
                : "transition-all duration-500"
            }`}
          >
            {currentResourceType === "musics" && (
              <FaCheck className="text-white text-2xl" />
            )}
          </div>
          <div className="flex flex-col items-start gap-1">
            <h4 className="text-2xl">Müzik Ekle</h4>
            <p className="text-sm">
              Bestelerini yükle, müziğin ve sesin başkalarına ulaşsın.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export const MessageForType = ({
  currentResourceType,
}: {
  currentResourceType: "projects" | "blogs";
}) => {
  return (
    <div className="text-center text-xl">
      {currentResourceType === "projects" && (
        <p className="text-gray-600">
          “Projelerini anlatmaya hazır mısın? Hadi başlayalım!”
        </p>
      )}
      {currentResourceType === "blogs" && (
        <p className="text-gray-600">
          “Blog yazmaya başlamak için harika bir zaman! Düşüncelerini paylaş.”
        </p>
      )}
      {currentResourceType === "musics" && (
        <p className="text-gray-600">
          “Müziklerini eklemek için sabırsızlanıyoruz! Sesini duyur.”
        </p>
      )}
    </div>
  );
};
