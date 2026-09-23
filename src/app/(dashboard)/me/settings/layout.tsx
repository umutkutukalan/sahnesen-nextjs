"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/UserContext";
import { usePathname, useRouter } from "next/navigation";
import { profileSettingsOptions } from "@/constants";
import { FiUser, FiTrash2 } from "react-icons/fi";
import { RiImageEditLine } from "react-icons/ri";
import { TbRosetteDiscountCheckFilled } from "react-icons/tb";
import Image from "next/image";
import { getOptimizedImageUrl } from "@/utils/ImageUtils";
import { compressCoverImage } from "@/utils/ImageCompression";
import CoverCropModal from "@/components/CoverCropModal";
import {
  removeCoverImg,
  removeProfileImg,
  updateCoverImg,
  updateProfileImg,
} from "@/services/client/user/user.service";
import { useGetUser } from "@/hooks/user/useGetUser";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, setUser } = useAuth();
  const { getUser, profileUser } = useGetUser();
  const router = useRouter();
  const pathname = usePathname();

  const [previewProfileImage, setPreviewProfileImage] = useState<string | null>(
    null,
  );
  const [previewCoverImg, setPreviewCoverImg] = useState<string | null>(null);
  const [compressedProfileImageData, setCompressedProfileImageData] =
    useState<any>(null);
  const [compressedCoverImgData, setCompressedCoverImgData] =
    useState<any>(null);

  const [removeProfileImageFlag, setRemoveProfileImageFlag] = useState(false);
  const [removeCoverImgFlag, setRemoveCoverImgFlag] = useState(false);

  const profileImageRef = useRef<HTMLInputElement>(null);
  const profileBorderRef = useRef<HTMLInputElement>(null);

  const [rawCoverImage, setRawCoverImage] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);

  useEffect(() => {
    if (user?.username) {
      getUser(user.username);
    }
  }, [user?.username]);

  const handleProfileImageSelect = () => profileImageRef.current?.click();
  const handleProfileBorderSelect = () => profileBorderRef.current?.click();

  const handleRemoveProfileImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewProfileImage(null);
    setCompressedProfileImageData(null);
    setRemoveProfileImageFlag(true);
  };

  const handleRemoveCoverImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewCoverImg(null);
    setCompressedCoverImgData(null);
    setRemoveCoverImgFlag(true);
  };

  const handleSaveImage = async () => {
    try {
      if (compressedProfileImageData) {
        const responseName = await updateProfileImg(compressedProfileImageData);
        setUser({ ...user, profileImg: responseName });
      } else if (removeProfileImageFlag) {
        await removeProfileImg();
        setUser({ ...user, profileImg: null });
      }

      if (compressedCoverImgData) {
        const responseName = await updateCoverImg(compressedCoverImgData);
        setUser({ ...user, coverImg: responseName });
      } else if (removeCoverImgFlag) {
        await removeCoverImg();
        setUser({ ...user, coverImg: null });
      }

      setPreviewProfileImage(null);
      setCompressedProfileImageData(null);
      setPreviewCoverImg(null);
      setCompressedCoverImgData(null);
      setRemoveProfileImageFlag(false);
      setRemoveCoverImgFlag(false);

      alert("Güncellemeler başarıyla kaydedildi!");
    } catch (error) {
      console.error("Resim güncellenirken hata:", error);
      alert("İşlem sırasında bir hata oluştu.");
    }
  };

  const handleProfileImageChange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      setPreviewProfileImage(URL.createObjectURL(file));
      setCompressedProfileImageData(file);
      setRemoveProfileImageFlag(false);
    }
  };

  const MIN_COVER_WIDTH = 2400;

  const handleProfileBorderChange = (event: any) => {
    const file = event.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      if (img.width < MIN_COVER_WIDTH) {
        alert(
          `Kapak fotoğrafı için en az ${MIN_COVER_WIDTH}px genişliğinde görsel önerilir.`,
        );
      }
      setRawCoverImage(previewUrl);
      setShowCropModal(true);
    };
    img.src = previewUrl;
  };

  const handleCropComplete = async (croppedFile: File) => {
    try {
      const compressed = await compressCoverImage(croppedFile);
      setPreviewCoverImg(URL.createObjectURL(compressed));
      setCompressedCoverImgData(compressed);
      setRemoveCoverImgFlag(false);
    } catch {
      setPreviewCoverImg(URL.createObjectURL(croppedFile));
      setCompressedCoverImgData(croppedFile);
      setRemoveCoverImgFlag(false);
    }
    setShowCropModal(false);
    setRawCoverImage(null);
  };

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const currentProfileImg = removeProfileImageFlag
    ? null
    : (user?.profileImg ?? profileUser?.profileImg);
  const currentCoverImg = removeCoverImgFlag
    ? null
    : (user?.coverImg ?? profileUser?.coverImg);

  const profileImgUrl = currentProfileImg
    ? currentProfileImg.startsWith("http")
      ? currentProfileImg
      : `${baseUrl}/${currentProfileImg.startsWith("/") ? currentProfileImg.slice(1) : currentProfileImg}`
    : null;

  const coverImgUrl = currentCoverImg
    ? currentCoverImg.startsWith("http")
      ? currentCoverImg
      : `${baseUrl}/${currentCoverImg.startsWith("/") ? currentCoverImg.slice(1) : currentCoverImg}`
    : null;

  const hasChanges =
    previewProfileImage ||
    previewCoverImg ||
    removeProfileImageFlag ||
    removeCoverImgFlag;

  // URL rotalarına göre aktif tab tespiti
  const getActiveTabTitle = () => {
    if (pathname?.includes("/social")) return "Bağlantılar";
    if (pathname?.includes("/privacy")) return "Gizlilik Ayarları";
    return "Hesap Bilgileri";
  };

  const handleTabClick = (title: string) => {
    if (title === "Hesap Bilgileri") router.push("/me/settings/profile");
    if (title === "Bağlantılar") router.push("/me/settings/social");
    if (title === "Gizlilik Ayarları") router.push("/me/settings/privacy");
  };

  return (
    <div className="min-h-screen">
      <div className="w-full">
        {/* Kapak Görseli Alanı */}
        <div className="w-full aspect-[5/1] bg-gray-700 relative z-10">
          <div
            className="relative w-full h-full overflow-hidden group cursor-pointer"
            onClick={handleProfileBorderSelect}
          >
            <input
              type="file"
              ref={profileBorderRef}
              onChange={handleProfileBorderChange}
              accept="image/*"
              className="hidden"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black hidden group-hover:block"></div>

            <div className="absolute left-0 top-0 z-50">
              {coverImgUrl && (
                <button
                  onClick={handleRemoveCoverImg}
                  className="p-2 bg-red-800 text-white cursor-pointer"
                  title="Kapak Görselini Kaldır"
                >
                  <FiTrash2 className="text-sm" />
                </button>
              )}
            </div>

            {previewCoverImg ? (
              <div className="w-full h-full transition-transform duration-200 group-hover:scale-105">
                <Image
                  src={previewCoverImg}
                  alt="Kapak Önizleme"
                  fill
                  quality={90}
                  className="object-cover"
                />
              </div>
            ) : coverImgUrl ? (
              <div className="relative w-full h-full transition-transform duration-200 group-hover:scale-105">
                <Image
                  src={coverImgUrl}
                  alt="Kapak Resmi"
                  fill
                  quality={90}
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <RiImageEditLine className="text-4xl text-gray-400" />
              </div>
            )}
          </div>

          {/* Profil Resmi Alanı */}
          <div
            className="absolute h-34 w-34 rounded-full bg-gray-200 -bottom-10 left-20 z-20 flex items-center justify-center group shadow-lg shadow-black/20 transition-all cursor-pointer"
            onClick={handleProfileImageSelect}
          >
            <input
              type="file"
              ref={profileImageRef}
              onChange={handleProfileImageChange}
              accept="image/*"
              className="hidden"
            />
            <div className="relative w-34 h-34 rounded-full overflow-hidden bg-gray-200 flex items-end justify-center shadow-lg shadow-black/20 flex-shrink-0">
              {previewProfileImage ? (
                <Image
                  src={getOptimizedImageUrl(previewProfileImage)}
                  alt=""
                  fill
                  className="hover:scale-105 transition-transform duration-200 object-cover"
                />
              ) : profileImgUrl ? (
                <div className="relative w-34 h-34">
                  <Image
                    src={profileImgUrl}
                    alt=""
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-200"
                  />
                </div>
              ) : (
                <FiUser className="text-8xl text-gray-500 group-hover:text-gray-300 transition-all" />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black hidden group-hover:block"></div>
            </div>

            <div className="absolute left-2 top-2 z-30">
              {profileImgUrl && (
                <button
                  type="button"
                  onClick={handleRemoveProfileImage}
                  className="p-2 bg-red-800 text-white rounded-full cursor-pointer"
                  title="Profil Resmini Kaldır"
                >
                  <FiTrash2 className="text-sm" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-15 px-20 flex flex-col gap-5">
          {/* Kullanıcı Bilgileri ve Bio */}
          <div className="w-full flex gap-10">
            <div className="flex flex-col">
              <h3 className="text-gray-500 text-xs">
                @{user?.username || "user"}
              </h3>
              <div className="flex items-center gap-1">
                <h1 className="text-lg">
                  {user?.name} {user?.surname}
                </h1>
                <TbRosetteDiscountCheckFilled
                  className="text-blue-500 text-2xl"
                  title="Onaylı Yazar"
                />
              </div>
              <p className="text-gray-500 text-xs whitespace-pre-line">
                {user?.bio || "Bu kullanıcı hakkında bilgi yok."}
              </p>
            </div>
          </div>

          {/* Yatay Tab Menü */}
          <div className="flex items-center gap-8 border-b border-gray-200">
            {profileSettingsOptions.map((option) => {
              const isActive = getActiveTabTitle() === option.title;
              return (
                <button
                  key={option.id}
                  onClick={() => handleTabClick(option.title)}
                  className={`pb-3 text-sm font-medium transition-colors cursor-pointer relative ${
                    isActive
                      ? "text-black border-b-2 border-black"
                      : "text-gray-500 hover:text-black"
                  }`}
                >
                  {option.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* --- ALT SAYFA İÇERİKLERİ BURAYA GELEcek --- */}
        <div className="px-20 py-5 w-full">{children}</div>
      </div>

      {/* Kaydet / İptal Barı */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 bg-green-100 h-20 flex items-center justify-between px-5 z-50 shadow-inner">
          <p className="text-gray-700">
            Profil görsellerinizde değişiklik yaptınız. Kaydetmek için butona
            tıklayın.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setPreviewProfileImage(null);
                setCompressedProfileImageData(null);
                setPreviewCoverImg(null);
                setCompressedCoverImgData(null);
                setRemoveProfileImageFlag(false);
                setRemoveCoverImgFlag(false);
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors cursor-pointer"
            >
              İptal
            </button>
            <button
              onClick={handleSaveImage}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors cursor-pointer"
            >
              Kaydet
            </button>
          </div>
        </div>
      )}

      {showCropModal && rawCoverImage && (
        <CoverCropModal
          imageSrc={rawCoverImage}
          onCancel={() => {
            setShowCropModal(false);
            setRawCoverImage(null);
          }}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
