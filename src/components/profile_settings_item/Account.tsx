import { IoIosArrowForward } from "react-icons/io";
import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { useUser } from "../../context/UserContext";
import { useSocialAccount } from "@/hooks/social_accounts/useSocialAccounts";

const Account = () => {
  const { user, setUser } = useUser(); // setUser'ı da import et
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    bio: "",
  });
  const { updateSocialAccount, isLoading, error } =
    useSocialAccount();
  const [editProfile, setEditProfile] = useState(false);
  const [hasChanges, setHasChanges] = useState(false); // Değişiklik kontrolü için

  console.log("User data in Account component:", user); // Debug için

  // Karakter limitleri
  const limits = {
    name: 25,
    surname: 25,
    bio: 150,
  };

  // Değişiklik olup olmadığını kontrol et
  const checkForChanges = (newFormData) => {
    const hasChanged =
      newFormData.name !== (user?.name || "") ||
      newFormData.surname !== (user?.surname || "") ||
      newFormData.bio !== (user?.bio || "");
    setHasChanges(hasChanged);
  };

  // Input değişikliklerini handle et
  const handleInputChange = (field, value) => {
    if (value.length <= limits[field]) {
      const newFormData = {
        ...formData,
        [field]: value,
      };
      setFormData(newFormData);
      checkForChanges(newFormData);
    }
  };

  // Modal açıldığında form verilerini resetle
  useEffect(() => {
    if (editProfile) {
      setFormData({
        name: user?.name || "",
        surname: user?.surname || "",
        bio: user?.bio || "",
      });
      setHasChanges(false); // Değişiklik bayrağını resetle
    }
  }, [editProfile, user, setFormData]);

  // Kaydet işlemi
  const handleSave = async () => {
    try {
      const updatedUser = await updateSocialAccount(user?.id, formData);

      // UserContext'teki user bilgisini güncelle
      setUser(updatedUser);

      setEditProfile(false);
      setHasChanges(false);

      console.log("Profil başarıyla güncellendi:", updatedUser);
    } catch (error) {
      console.error("Güncelleme hatası:", error);
    }
  };

  return (
    <>
      <div
        className="w-full h-20 flex items-center justify-between cursor-pointer"
        onClick={() => setEditProfile(true)}
      >
        <div className="flex flex-col">
          <h3>Profil Bilgileri</h3>
          <p className="text-xs text-gray-500">
            Ad, soyad ve bio bilgilerinizi düzenleyebilirsiniz.
          </p>
        </div>
        <div className="text-lg text-gray-500">
          <IoIosArrowForward />
        </div>
      </div>

      {/* Modal */}
      {editProfile && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-xs z-100"
          onClick={() => setEditProfile(false)}
        >
          <div
            className="w-120 h-150 bg-white rounded-lg overflow-hidden shadow-lg flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg">Profil Detayları</h3>
                <button
                  onClick={() => setEditProfile(false)}
                  className="p-1 rounded-full transition-colors cursor-pointer"
                >
                  <IoClose className="text-xl text-gray-500" />
                </button>
              </div>
              <div className="h-full w-full flex flex-col gap-5 px-10 py-5">
                <div className="flex flex-col gap-1 text-sm">
                  <label htmlFor="name">Ad*</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    id="name"
                    className="focus:outline-none border border-gray-200 focus:border-gray-600 rounded-sm p-2 w-full h-10"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>En fazla {limits.name} karakter girebilirsiniz</span>
                    <span
                      className={
                        formData.name.length > limits.name * 0.8
                          ? "text-orange-500"
                          : ""
                      }
                    >
                      {formData.name.length}/{limits.name}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 text-sm">
                  <label htmlFor="surname">Soyad*</label>
                  <input
                    type="text"
                    value={formData.surname}
                    onChange={(e) =>
                      handleInputChange("surname", e.target.value)
                    }
                    id="surname"
                    className="focus:outline-none border border-gray-200 focus:border-gray-600 rounded-md p-2 w-full h-10"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>
                      En fazla {limits.surname} karakter girebilirsiniz
                    </span>
                    <span
                      className={
                        formData.surname.length > limits.surname * 0.8
                          ? "text-orange-500"
                          : ""
                      }
                    >
                      {formData.surname.length}/{limits.surname}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 text-sm">
                  <label htmlFor="bio">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    id="bio"
                    placeholder="Kendiniz hakkında kısa bir açıklama..."
                    className="text-xs w-full h-24 focus:outline-none p-2 border border-gray-200 focus:border-gray-600 rounded-md resize-none overflow-hidden leading-tight placeholder-gray-400 text-gray-800"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>En fazla {limits.bio} karakter girebilirsiniz</span>
                    <span
                      className={
                        formData.bio.length > limits.bio * 0.8
                          ? "text-orange-500"
                          : ""
                      }
                    >
                      {formData.bio.length}/{limits.bio}
                    </span>
                  </div>
                </div>
                {error && (
                  <div className="text-red-500 text-xs p-2 bg-red-50 rounded-md">
                    Güncelleme sırasında bir hata oluştu. Lütfen tekrar deneyin.
                  </div>
                )}
              </div>
            </div>
            <div className="w-full flex items-center justify-end gap-2 px-10 py-5">
              <button
                onClick={() => setEditProfile(false)}
                className="border border-gray-500 text-black rounded-md px-4 py-2 text-xs cursor-pointer hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges || isLoading}
                className={`rounded-md px-4 py-2 text-xs transition-colors ${
                  hasChanges && !isLoading
                    ? "bg-gray-500 hover:bg-gray-600 text-white cursor-pointer"
                    : "bg-gray-100 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isLoading ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Account;
