import { FiUser } from "react-icons/fi";
import { TbRosetteDiscountCheckFilled } from "react-icons/tb";
import { RiImageEditLine } from "react-icons/ri";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/UserContext";
import {
  updateCoverImg,
  updateProfileImg,
  updateUser,
} from "../../services/client/user/user.service";
import {
  compressCoverImage,
  compressProfileBorder,
  compressProfileImage,
} from "../../utils/ImageCompression";
import Image from "next/image";
import EmailField from "../profile_settings_item/EmailField";
import Account from "../profile_settings_item/Account";
import DeleteAccount from "../profile_settings_item/DeleteAccount";
import DeactivateAccount from "../profile_settings_item/DeactivateAccount";
import { useGetUser } from "@/hooks/user/useGetUser";
import { getOptimizedImageUrl } from "@/utils/ImageUtils";
import CoverCropModal from "../CoverCropModal";

const ProfileDetails = ({ usernameSlug }: { usernameSlug: string }) => {
  const { user, setUser } = useAuth(); // sadece setUser için (kaydetme sonrası güncelleme)
  const { getUser, profileUser, isLoading } = useGetUser();
  const [previewProfileImage, setPreviewProfileImage] = useState(null); // Preview URL
  const [previewCoverImg, setPreviewCoverImg] = useState(null); // Preview URL for coverImg
  const [compressedProfileImageData, setCompressedProfileImageData] =
    useState(null); // Sıkıştırılmış veri
  const [compressedCoverImgData, setCompressedCoverImgData] = useState(null); // Sıkıştırılmış border veri
  const profileImageRef = useRef(null); // File input referansı
  const profileBorderRef = useRef(null); // File input referansı for border

  const [rawCoverImage, setRawCoverImage] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);

  useEffect(() => {
    if (usernameSlug) {
      getUser(usernameSlug);
    }
  }, [usernameSlug]);

  // Resim seçme fonksiyonu
  const handleProfileImageSelect = () => {
    profileImageRef.current?.click();
  };
  const handleProfileBorderSelect = () => {
    profileBorderRef.current?.click();
  };

  // Resim kaydetme fonksiyonu
  const handleSaveImage = async () => {
    try {
      let newProfileImgName = user?.profileImg;
      let newCoverImgName = profileUser?.coverImg;

      // 1. Profil Resmi Güncelleme
      if (compressedProfileImageData) {
        const responseName = await updateProfileImg(compressedProfileImageData);
        // Backend'den düz string (dosya adı) geldiğini varsayıyoruz
        newProfileImgName = responseName;

        // Context'i ve mevcut profileUser state'ini yerelde anında güncelle
        const updatedUser = { ...user, profileImg: responseName };
        setUser(updatedUser);

        if (profileUser) {
          profileUser.profileImg = responseName; // Ekranın anında tetiklenmesi için
        }
      }

      // 2. Kapak Resmi Güncelleme (Geliştireceğin zaman buraya ekleyebilirsin)
      if (compressedCoverImgData) {
        const responseName = await updateCoverImg(compressedCoverImgData);
        newCoverImgName = responseName;
        const updatedUser = { ...user, coverImg: responseName };
        setUser(updatedUser);
        if (profileUser) {
          profileUser.coverImg = responseName;
        }
      }

      // State'leri temizle (Yeşil barın kapanması için)
      setPreviewProfileImage(null);
      setCompressedProfileImageData(null);
      setPreviewCoverImg(null);
      setCompressedCoverImgData(null);

      alert("Güncellemeler başarıyla kaydedildi!");
    } catch (error) {
      console.error("Resim güncellenirken hata:", error);
      alert("Resim güncellenirken bir hata oluştu.");
    }
  };

  // File input change handler
  const handleProfileImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // 1. Tarayıcıda resmi hemen göstermek için geçici bir güvenli URL üretir (Base64 DEĞİLDİR)
      const previewUrl = URL.createObjectURL(file);
      setPreviewProfileImage(previewUrl);

      // 2. Veri olarak DOĞRUDAN dosyanın kendisini sakla!
      setCompressedProfileImageData(file);

      console.log("Seçilen gerçek dosya nesnesi:", file);
    }
  };

  const handleProfileBorderChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setRawCoverImage(previewUrl);
      setShowCropModal(true);
    }
  };

  const handleCropComplete = async (croppedFile: File) => {
    try {
      const compressed = await compressCoverImage(croppedFile);
      const previewUrl = URL.createObjectURL(compressed);
      setPreviewCoverImg(previewUrl);
      setCompressedCoverImgData(compressed);
    } catch (error) {
      console.error("Cover sıkıştırma hatası:", error);
      // Sıkıştırma başarısız olursa kırpılmış orijinali kullan
      const previewUrl = URL.createObjectURL(croppedFile);
      setPreviewCoverImg(previewUrl);
      setCompressedCoverImgData(croppedFile);
    }
    setShowCropModal(false);
    setRawCoverImage(null);
  };

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  const currentProfileImg = user?.profileImg ?? profileUser?.profileImg;
  const currentCoverImg = user?.coverImg ?? profileUser?.coverImg;

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

  // Hatanın nerede olduğunu görmek için buraya mutlaka log atıp terminalden/konsoldan izle:
  console.log("Hesaplanan Tam Kapak URL'i: ", coverImgUrl);

  return (
    <div className="min-h-screen">
      <div className="w-full">
        <div className="w-full">
          {/* Profil resmi ve bilgileri */}
          <div className="w-full h-70 bg-gray-700 relative z-10">
            <div
              className="relative w-full h-full overflow-hidden group cursor-pointer relative"
              onClick={handleProfileBorderSelect}
            >
              {/* Gizli file input */}
              <input
                type="file"
                ref={profileBorderRef}
                onChange={handleProfileBorderChange}
                accept="image/*"
                className="hidden"
              />

              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black hidden group-hover:block"></div>

              <div className="absolute inset-0 flex items-center justify-center transition-all">
                <RiImageEditLine className="text-4xl text-white transition-colors duration-100 hidden group-hover:block transition-all drop-shadow-lg" />
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
                  <RiImageEditLine className="text-4xl text-gray-500" />
                </div>
              )}
            </div>
            <div
              className="absolute h-30 w-30 rounded-full overflow-hidden bg-gray-200 -bottom-10 left-20 z-20 flex items-center justify-center group shadow-lg shadow-black/20 transition-all cursor-pointer"
              onClick={handleProfileImageSelect}
            >
              {/* Gizli file input */}
              <input
                type="file"
                ref={profileImageRef}
                onChange={handleProfileImageChange}
                accept="image/*"
                className="hidden"
              />

              {/* Resim önizlemesi - eğer yeni resim seçildiyse onu göster, yoksa mevcut resmi göster */}
              <div className="relative w-34 h-34 rounded-full overflow-hidden bg-gray-200 mb-4 flex items-center justify-center shadow-lg shadow-black/20 flex-shrink-0">
                {previewProfileImage ? (
                  <Image
                    src={getOptimizedImageUrl(previewProfileImage)}
                    alt=""
                    fill
                    className="hover:scale-105 transition-transform duration-200 object-cover"
                    style={{
                      imageRendering: "auto",
                    }}
                  />
                ) : profileImgUrl ? (
                  <Image
                    src={profileImgUrl}
                    alt=""
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-200 w-full h-full"
                    style={{
                      imageRendering: "auto",
                    }}
                  />
                ) : (
                  <FiUser className="text-7xl text-gray-500 group-hover:text-gray-300 transition-all" />
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black hidden group-hover:block"></div>
              {/* Edit icon overlay */}
              <div className="absolute inset-0 flex items-center justify-center transition-all">
                <RiImageEditLine className="text-4xl text-white transition-colors duration-100 hidden group-hover:block transition-all drop-shadow-lg" />
              </div>
            </div>
          </div>
          <div className="mt-15 px-20 flex flex-col gap-5">
            <div className="w-full flex gap-10 border-b border-gray-200 pb-4">
              <div className="flex flex-col">
                <h3 className="text-gray-500 text-xs">
                  @{profileUser?.username || "user"}
                </h3>
                <div className="flex items-center gap-1">
                  <h1 className="text-lg">
                    {profileUser?.name} {profileUser?.surname}
                  </h1>
                  <TbRosetteDiscountCheckFilled
                    className="text-blue-500 text-2xl"
                    title="Onaylı Yazar"
                  />
                </div>
                <p className="text-gray-500 text-xs">
                  {profileUser?.bio || "Bu kullanıcı hakkında bilgi yok."}
                </p>
              </div>
            </div>
            <div className="w-full flex flex-col">
              <Account />
              <EmailField />
              <DeactivateAccount />
              <DeleteAccount />
            </div>
          </div>
        </div>
        {(previewProfileImage || previewCoverImg) && (
          <div className="fixed bottom-0 left-0 right-0 bg-green-100 h-20 flex items-center justify-between px-5 z-50">
            <p className="text-gray-700">
              Yeni profil resminiz hazır. Kaydetmek için butona tıklayın.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setPreviewProfileImage(null);
                  setCompressedProfileImageData(null);
                  setPreviewCoverImg(null);
                  setCompressedCoverImgData(null);
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
