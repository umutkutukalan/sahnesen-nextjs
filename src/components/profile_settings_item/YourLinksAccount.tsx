import { useEffect, useState } from "react";
import { IoIosArrowForward } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { useUser } from "../../context/UserContext";
import { useSocialAccount } from "@/hooks/social_accounts/useSocialAccounts";

const YourLinksAccount = ({ onUpdate }) => {
  const { user } = useUser();
  const { createSocialAccount, isLoading, error } = useSocialAccount();
  const [editSettings, setEditSettings] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [accountData, setAccountData] = useState({
    platform: "",
    username: "",
    url: "",
    isPublic: false,
  });

  console.log("User data in Account component:", user);

  // URL önizlemesi oluşturma fonksiyonu
  const generatePreviewUrl = (platform, username) => {
    if (!platform || !username) return "";

    const cleanUsername = username.startsWith("@")
      ? username.substring(1)
      : username;

    switch (platform) {
      case "Instagram":
        return "https://instagram.com/" + cleanUsername;
      case "Facebook":
        return "https://facebook.com/" + cleanUsername;
      case "YouTube":
        return "https://youtube.com/@" + cleanUsername;
      case "Twitter":
      case "X":
        return "https://x.com/" + cleanUsername;
      case "LinkedIn":
        return "https://linkedin.com/in/" + cleanUsername;
      case "Github":
        return "https://github.com/" + cleanUsername;
      default:
        return "";
    }
  };

  // Karakter limitleri
  const limits = {
    username: 50,
  };

  // Değişiklik olup olmadığını kontrol et
  const checkForChanges = (newFormData) => {
    const hasChanged =
      newFormData.platform !== (user?.platform || "") ||
      newFormData.username !== (user?.username || "") ||
      newFormData.isPublic !== (user?.isPublic || false);
    setHasChanges(hasChanged);
  };

  // Input değişikliklerini handle et
  const handleInputChange = (field, value) => {
    // Platform için limit kontrolü yapma, diğer alanlar için yap
    if (
      field === "platform" ||
      !limits[field] ||
      value.length <= limits[field]
    ) {
      const newAccountData = {
        ...accountData,
        [field]: value,
      };
      setAccountData(newAccountData);
      checkForChanges(newAccountData);
    }
  };

  // Modal açıldığında form verilerini resetle
  useEffect(() => {
    if (editSettings) {
      setAccountData({
        platform: user?.platform || "",
        username: user?.username || "",
        url: user?.url || "",
        isPublic: user?.isPublic || false,
      });
      setHasChanges(false);
    }
  }, [editSettings, user, setAccountData]);

  // Kaydet işlemi
  const handleSave = async () => {
    // Eğer url girilmemişse, otomatik önizleme url'sini ekle
    const urlToSave =
      accountData.url ||
      generatePreviewUrl(accountData.platform, accountData.username);
    const updatedAccountData = { ...accountData, url: urlToSave };
    console.log("Kaydedilecek hesap verisi:", updatedAccountData);
    try {
      const updatedUser = await createSocialAccount(
        user?.id,
        updatedAccountData
      );
      setEditSettings(false);
      setHasChanges(false);
      if (typeof onUpdate === "function") {
        onUpdate();
      }
      console.log("Sosya Medya Profili eklendi:", updatedUser);
    } catch (error) {
      console.error("Güncelleme hatası:", error);
    }
  };

  return (
    <>
      <div
        onClick={() => setEditSettings(true)}
        className="w-full h-20 flex items-center justify-between cursor-pointer"
      >
        <div className="flex flex-col">
          <h3>Hesaplarınızı Bağlayın</h3>
          <p className="text-xs text-gray-500">
            Sosyal medya hesaplarınızı kullanıcı adlarınızla bağlayın.
          </p>
        </div>
        <div className="text-lg text-gray-500">
          <IoIosArrowForward />
        </div>
      </div>
      {/* Modal */}
      {editSettings && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-xs z-100"
          onClick={() => setEditSettings(false)}
        >
          <div
            className="w-120 h-150 bg-white rounded-lg overflow-hidden shadow-lg flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg">Hesaplarınızı Bağlayın</h3>
                <button
                  onClick={() => setEditSettings(false)}
                  className="p-1 rounded-full transition-colors cursor-pointer"
                >
                  <IoClose className="text-xl text-gray-500" />
                </button>
              </div>
              <div className="h-full w-full flex flex-col gap-5 px-10 py-5">
                <div className="flex flex-col gap-1 text-sm">
                  <label htmlFor="platform">Platform*</label>
                  <select
                    value={accountData.platform || ""}
                    onChange={(e) =>
                      handleInputChange("platform", e.target.value)
                    }
                    id="platform"
                    className="focus:outline-none border border-gray-200 focus:border-gray-600 rounded-md p-2 w-full h-10"
                  >
                    <option value="">Platform Seçin</option>
                    <option value="Instagram">Instagram</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Twitter/X">Twitter/X</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Github">Github</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1 text-sm">
                  <label htmlFor="username">Kullanıcı Adı</label>
                  <input
                    type="text"
                    value={accountData.username || ""}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                    id="username"
                    placeholder="kullanici_adi"
                    className="focus:outline-none border border-gray-200 focus:border-gray-600 rounded-md p-2 w-full h-10"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>
                      En fazla {limits.username} karakter girebilirsiniz
                    </span>
                    <span
                      className={
                        (accountData.username || "").length >
                          limits.username * 0.8
                          ? "text-orange-500"
                          : ""
                      }
                    >
                      {(accountData.username || "").length}/{limits.username}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 text-sm">
                  {/* Otomatik URL önizlemesi */}
                  {accountData.platform &&
                    accountData.username &&
                    !accountData.url && (
                      <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded-md">
                        <strong>Önizleme:</strong>{" "}
                        {generatePreviewUrl(
                          accountData.platform,
                          accountData.username
                        )}
                      </div>
                    )}
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={accountData.isPublic || false}
                    onChange={(e) =>
                      setAccountData({
                        ...accountData,
                        isPublic: e.target.checked,
                      })
                    }
                    id="isPublic"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isPublic" className="cursor-pointer">
                    Bu bağlantıyı profilde göster
                  </label>
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
                onClick={() => setEditSettings(false)}
                className="border border-gray-500 text-black rounded-md px-4 py-2 text-xs cursor-pointer hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges || isLoading}
                className={`rounded-md px-4 py-2 text-xs transition-colors ${hasChanges && !isLoading
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

export default YourLinksAccount;
