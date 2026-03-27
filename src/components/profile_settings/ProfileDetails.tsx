import { FiUser } from "react-icons/fi";
import { TbRosetteDiscountCheckFilled } from "react-icons/tb";
import Account from "../../components/ProfileSettingsItems/Account";
import { RiImageEditLine } from "react-icons/ri";
import { useState, useRef } from "react";
import { useUser } from "../../context/UserContext";
import { updateUserService } from "../../services/ProfileServices/updateUserService";
import {
    compressProfileBorder,
    compressProfileImage,
} from "../../utils/imageCompression";
import { getOptimizedImageUrl } from "../../utils/imageUtils";
import EmailField from "../ProfileSettingsItems/EmailField";
import DeactivateAccount from "../ProfileSettingsItems/DeactivateAccount";
import DeleteAccount from "../ProfileSettingsItems/DeleteAccount";
import Image from "next/image";

const ProfileDetails = ({ user }) => {
    const { setUser } = useUser(); // UserContext'ten setUser fonksiyonunu al
    const [previewProfileImage, setPreviewProfileImage] = useState(null); // Preview URL
    const [previewProfileBorder, setPreviewProfileBorder] = useState(null); // Preview URL for border
    const [compressedProfileImageData, setCompressedProfileImageData] =
        useState(null); // Sıkıştırılmış veri
    const [compressedProfileBorderData, setCompressedProfileBorderData] =
        useState(null); // Sıkıştırılmış border veri
    const profileImageRef = useRef(null); // File input referansı
    const profileBorderRef = useRef(null); // File input referansı for border

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
            const formData = {};
            if (compressedProfileImageData) {
                formData.profileImg = compressedProfileImageData;
            } else if (compressedProfileBorderData) {
                formData.profileBorder = compressedProfileBorderData;
            }

            const updatedUser = await updateUserService(formData);
            setUser(updatedUser); // UserContext'i güncelle

            setPreviewProfileImage(null);
            setCompressedProfileImageData(null);
            setPreviewProfileBorder(null);
            setCompressedProfileBorderData(null);

            alert("Güncellemeler başarıyla kaydedildi !");
        } catch (error) {
            console.error("Resim güncellenirken hata:", error);
            alert("Resim güncellenirken bir hata oluştu.");
        }
    };

    // File input change handler
    const handleProfileImageChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                // Utility fonksiyonu ile sıkıştır
                const compressedBase64 = await compressProfileImage(file);

                // Preview ve veriyi sakla
                setPreviewProfileImage(compressedBase64);
                setCompressedProfileImageData(compressedBase64);

                console.log("Seçilen resim:", file);
                console.log("Resim adı:", file.name);
                console.log("Resim boyutu:", file.size);
                console.log("Resim tipi:", file.type);
            } catch (error) {
                console.error("Resim sıkıştırma hatası:", error);
                alert("Resim işlenirken bir hata oluştu: " + error.message);
            }
        }
    };

    const handleProfileBorderChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                // Utility fonksiyonu ile sıkıştır
                const compressedBase64 = await compressProfileBorder(file);

                // Preview ve veriyi sakla
                setPreviewProfileBorder(compressedBase64);
                setCompressedProfileBorderData(compressedBase64);

                console.log("Seçilen resim:", file);
                console.log("Resim adı:", file.name);
                console.log("Resim boyutu:", file.size);
                console.log("Resim tipi:", file.type);
            } catch (error) {
                console.error("Resim sıkıştırma hatası:", error);
                alert("Resim işlenirken bir hata oluştu: " + error.message);
            }
        }
    };

    return (
        <div className="min-h-screen">
            <div className="w-full">
                <div className="w-full">
                    {/* Profil resmi ve bilgileri */}
                    <div className="w-full h-70 bg-gray-700 relative z-10">
                        <div
                            className="w-full h-full overflow-hidden group cursor-pointer"
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
                            {previewProfileBorder ? (
                                <Image
                                    src={getOptimizedImageUrl(previewProfileBorder)}
                                    alt=""
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                                    style={{
                                        imageRendering: "auto",
                                        WebkitImageRendering: "auto",
                                    }}
                                />
                            ) : user?.profileBorder ? (
                                <Image
                                    src={getOptimizedImageUrl(user.profileBorder)} // Artık direkt base64 string
                                    alt=""
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                                    style={{
                                        imageRendering: "auto",
                                        WebkitImageRendering: "auto",
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <RiImageEditLine className="text-4xl text-gray-500" />
                                </div>
                            )}
                        </div>
                        <div
                            className="absolute h-30 w-30 rounded-full overflow-hidden bg-gray-200 -bottom-10 left-20 shadow-lg z-20 flex items-center justify-center group transition-all cursor-pointer"
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
                            {previewProfileImage ? (
                                <Image
                                    src={getOptimizedImageUrl(previewProfileImage)}
                                    alt=""
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                                    style={{
                                        imageRendering: "auto",
                                        WebkitImageRendering: "auto",
                                    }}
                                />
                            ) : user?.profileImg ? (
                                <Image
                                    src={getOptimizedImageUrl(user.profileImg)} // Artık direkt base64 string
                                    alt=""
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                                    style={{
                                        imageRendering: "auto",
                                        WebkitImageRendering: "auto",
                                    }}
                                />
                            ) : (
                                <FiUser className="text-7xl text-gray-500 group-hover:text-gray-300 transition-all" />
                            )}
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
                                <p className="text-gray-500 text-xs">
                                    {user?.bio || "Bu kullanıcı hakkında bilgi yok."}
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
                {(previewProfileImage || previewProfileBorder) && (
                    <div className="fixed bottom-0 left-0 right-0 bg-green-100 h-20 flex items-center justify-between px-5 z-50">
                        <p className="text-gray-700">
                            Yeni profil resminiz hazır. Kaydetmek için butona tıklayın.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    `
                    ${previewProfileImage
                                            ? (setPreviewProfileImage(null),
                                                setCompressedProfileImageData(null))
                                            : (setPreviewProfileBorder(null),
                                                setCompressedProfileBorderData(null))
                                        }
                `;
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
            </div>
        </div>
    );
};

export default ProfileDetails;
