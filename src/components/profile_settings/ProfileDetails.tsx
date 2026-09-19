import { FiUser, FiTrash2 } from "react-icons/fi";
import { TbRosetteDiscountCheckFilled } from "react-icons/tb";
import { RiImageEditLine } from "react-icons/ri";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/UserContext";
import {
  removeCoverImg,
  removeProfileImg,
  updateCoverImg,
  updateProfileImg,
  updateUser, // Profil güncelleme servisi (resimleri null yapmak için gerekli)
} from "../../services/client/user/user.service";
import { compressCoverImage } from "../../utils/ImageCompression";
import Image from "next/image";
import EmailField from "../profile_settings_item/EmailField";
import Account from "../profile_settings_item/Account";
import DeleteAccount from "../profile_settings_item/DeleteAccount";
import DeactivateAccount from "../profile_settings_item/DeactivateAccount";
import { useGetUser } from "@/hooks/user/useGetUser";
import { getOptimizedImageUrl } from "@/utils/ImageUtils";
import CoverCropModal from "../CoverCropModal";
import { profileSettingsOptions } from "@/constants";
import SocialAccounts from "./SocialAccounts";

const ProfileDetails = ({ usernameSlug }: { usernameSlug: string }) => {
  const { user, setUser } = useAuth();
  const { getUser, profileUser, isLoading } = useGetUser();
  const [activeTab, setActiveTab] = useState("Hesap Bilgileri");
  const [previewProfileImage, setPreviewProfileImage] = useState(null);
  const [previewCoverImg, setPreviewCoverImg] = useState(null);
  const [compressedProfileImageData, setCompressedProfileImageData] =
    useState(null);
  const [compressedCoverImgData, setCompressedCoverImgData] = useState(null);

  console.log("user", user);
  console.log("profileUser", profileUser);

  // Resimlerin silinip silinmediğini takip etmek için flag'ler
  const [removeProfileImageFlag, setRemoveProfileImageFlag] = useState(false);
  const [removeCoverImgFlag, setRemoveCoverImgFlag] = useState(false);

  const profileImageRef = useRef(null);
  const profileBorderRef = useRef(null);

  const [rawCoverImage, setRawCoverImage] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);

  useEffect(() => {
    if (usernameSlug) {
      getUser(usernameSlug);
    }
  }, [usernameSlug]);

  const handleProfileImageSelect = () => {
    profileImageRef.current?.click();
  };
  const handleProfileBorderSelect = () => {
    profileBorderRef.current?.click();
  };

  // Resmi kaldırma fonksiyonları
  const handleRemoveProfileImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Kapsayıcının click event'ini tetiklemesin (dosya seçici açılmasın)
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

  // Resim kaydetme fonksiyonu
  const handleSaveImage = async () => {
    try {
      // 1. Profil Resmi İşlemleri
      if (compressedProfileImageData) {
        const responseName = await updateProfileImg(compressedProfileImageData);
        const updatedUser = { ...user, profileImg: responseName };
        setUser(updatedUser);
        if (profileUser) profileUser.profileImg = responseName;
      } else if (removeProfileImageFlag) {
        await removeProfileImg();
        const updatedUser = { ...user, profileImg: null };
        setUser(updatedUser);
        if (profileUser) profileUser.profileImg = null;
      }

      // 2. Kapak Resmi İşlemleri
      if (compressedCoverImgData) {
        const responseName = await updateCoverImg(compressedCoverImgData);
        const updatedUser = { ...user, coverImg: responseName };
        setUser(updatedUser);
        if (profileUser) profileUser.coverImg = responseName;
      } else if (removeCoverImgFlag) {
        await removeCoverImg();
        const updatedUser = { ...user, coverImg: null };
        setUser(updatedUser);
        if (profileUser) profileUser.coverImg = null;
      }

      // State'leri temizle
      setPreviewProfileImage(null);
      setCompressedProfileImageData(null);
      setPreviewCoverImg(null);
      setCompressedCoverImgData(null);
      setRemoveProfileImageFlag(false);
      setRemoveCoverImgFlag(false);

      alert("Güncellemeler başarıyla kaydedildi!");
    } catch (error) {
      console.error("Resim güncellenirken/silinirken hata:", error);
      alert("İşlem sırasında bir hata oluştu.");
    }
  };

  const handleProfileImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreviewProfileImage(previewUrl);
      setCompressedProfileImageData(file);
      setRemoveProfileImageFlag(false); // Yeni seçildiyse silme flag'ini sıfırla
    }
  };

  const MIN_COVER_WIDTH = 2400;

  const handleProfileBorderChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      if (img.width < MIN_COVER_WIDTH) {
        alert(
          `Kapak fotoğrafı için en az ${MIN_COVER_WIDTH}px genişliğinde bir görsel önerilir.`,
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
      const previewUrl = URL.createObjectURL(compressed);
      setPreviewCoverImg(previewUrl);
      setCompressedCoverImgData(compressed);
      setRemoveCoverImgFlag(false);
    } catch (error) {
      const previewUrl = URL.createObjectURL(croppedFile);
      setPreviewCoverImg(previewUrl);
      setCompressedCoverImgData(croppedFile);
      setRemoveCoverImgFlag(false);
    }
    setShowCropModal(false);
    setRawCoverImage(null);
  };

  // Eğer kendi profil detay sayfasındaysak ve global user değişirse profileUser'ı da güncelle
  useEffect(() => {
    if (user && profileUser && user.username === profileUser.username) {
      // user güncellendiğinde profileUser'ın ad, soyad ve bio'sunu da senkronize et
      profileUser.name = user.name;
      profileUser.surname = user.surname;
      profileUser.bio = user.bio;
    }
  }, [user]);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  // Eğer silme flag'i aktifse resmi null göster
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

  return (
    <div className="min-h-screen">
      <div className="w-full">
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

              {/* Kapak Resmi Üzerindeki Düzenleme / Kaldırma Butonları */}
              <div className="absolute left-0 top-0 z-50">
                {coverImgUrl && (
                  <button
                    onClick={handleRemoveCoverImg}
                    className="p-2 bg-red-800 text-white items-center justify-center cursor-pointer"
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

              <div className="relative w-34 h-34 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center shadow-lg shadow-black/20 flex-shrink-0">
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
                  <FiUser className="text-7xl text-gray-500 group-hover:text-gray-300 transition-all" />
                )}

                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black hidden group-hover:block"></div>
              </div>

              {/* Profil Resmi Üzerindeki Düzenleme / Kaldırma Butonları */}
              <div className="absolute left-2 top-2 items-center justify-center z-30">
                {profileImgUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveProfileImage}
                    className="p-2 bg-red-800 text-white rounded-full items-center justify-center cursor-pointer"
                    title="Profil Resmini Kaldır"
                  >
                    <FiTrash2 className="text-sm" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-15 px-20 flex flex-col gap-5">
            {/* Kullanıcı Adı ve Bio Alanı */}
            <div className="w-full flex gap-10 border-b border-gray-200 pb-4">
              <div className="flex flex-col">
                <h3 className="text-gray-500 text-xs">
                  @{user?.username || "user"}
                </h3>
                <div className="flex items-center gap-1">
                  <h1 className="text-lg">
                    {user?.name} {user?.surname}
                  </h1>
                </div>
                <p className="text-gray-500 text-xs whitespace-pre-line">
                  {user?.bio || "Bu kullanıcı hakkında bilgi yok."}
                </p>
              </div>
            </div>

            {/* --- YATAY TAB MENÜ (Resimlerin ve Bio'nun Hemen Altı) --- */}
            <div className="flex items-center gap-8 border-b border-gray-200">
              {profileSettingsOptions.map((option) => {
                const isActive = activeTab === option.title;
                return (
                  <button
                    key={option.id}
                    onClick={() => setActiveTab(option.title)}
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

            {/* --- SEKMELERE GÖRE DEĞİŞEN İÇERİK ALANI --- */}
            <div className="w-full flex flex-col py-2">
              {activeTab === "Hesap Bilgileri" && (
                <div className="flex flex-col gap-5">
                  <Account />
                  <DeactivateAccount />
                  <DeleteAccount />
                </div>
              )}

              {activeTab === "Bağlantılar" && <SocialAccounts user={user} />}

              {activeTab === "Gizlilik Ayarları" && (
                <div className="text-gray-500 py-4">
                  Gizlilik ayarları yakında burada yer alacak.
                </div>
              )}
            </div>
          </div>
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
    </div>
  );
};

export default ProfileDetails;
