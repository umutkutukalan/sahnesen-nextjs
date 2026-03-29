import { useEffect, useState } from "react";
import { useAuth } from "../../context/UserContext";
import { IoClose } from "react-icons/io5";
import { BsBoxArrowUpRight } from "react-icons/bs";
import { useSocialAccount } from "@/hooks/social_accounts/useSocialAccounts";

const EditAccounts = ({ editSettings, setEditSettings, account, onUpdate }) => {
  const { user } = useAuth();
  const [hasChanges, setHasChanges] = useState(false);
  const [deleteCheck, setDeleteCheck] = useState(false);
  const [updateAccountData, setUpdateAccountData] = useState({
    username: "",
    url: "",
    isPublic: false,
  });

  const { updateSocialAccount, deleteSocialAccount, isLoading, error } = useSocialAccount();


  console.log("EditAccounts component - account:", account);
  console.log("EditAccounts component - account id:", account?.id);

  // URL önizlemesi oluşturma fonksiyonu
  const generatePreviewUrl = (platform, username) => {
    if (!platform || !username) return "";

    const cleanUsername = username.startsWith("@")
      ? username.substring(1)
      : username;

    switch (platform.toUpperCase()) {
      case "INSTAGRAM":
        return "https://instagram.com/" + cleanUsername;
      case "FACEBOOK":
        return "https://facebook.com/" + cleanUsername;
      case "YOUTUBE":
        return "https://youtube.com/@" + cleanUsername;
      case "TWITTER":
      case "X":
        return "https://x.com/" + cleanUsername;
      case "LINKEDIN":
        return "https://linkedin.com/in/" + cleanUsername;
      case "GITHUB":
        return "https://github.com/" + cleanUsername;
      case "KICK":
        return "https://kick.com/" + cleanUsername;
      case "WEBSITE":
        return username; // Website için direkt URL
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
      newFormData.platform !== (account?.platform || "") ||
      newFormData.username !== (account?.username || "") ||
      newFormData.isPublic !== (account?.isPublic || false);
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
        ...updateAccountData,
        [field]: value,
      };
      setUpdateAccountData(newAccountData);
      checkForChanges(newAccountData);
    }
  };

  // Modal açıldığında form verilerini resetle
  useEffect(() => {
    if (editSettings) {
      setUpdateAccountData({
        username: account?.username || "",
        url: account?.url || "",
        isPublic: account?.isPublic || false,
      });
      setHasChanges(false);
    }
  }, [editSettings, user, setUpdateAccountData]);

  // Kaydet işlemi
  const handleSave = async () => {
    // Eğer url girilmemişse, otomatik önizleme url'sini ekle
    const urlToSave = generatePreviewUrl(
      account?.platform,
      updateAccountData.username
    );
    const updatedAccountData = { ...updateAccountData, url: urlToSave };
    try {
      const updatedUser = await updateSocialAccount(
        account?.id,
        updatedAccountData
      );
      setEditSettings(false);
      setHasChanges(false);
      if (typeof onUpdate === "function") {
        onUpdate();
      }
      console.log("Sosya Medya Profili Gücellendi:", updatedUser);
    } catch (error) {
      console.error("Güncelleme hatası:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSocialAccount(account?.id);
      setEditSettings(false);
      if (typeof onUpdate === "function") {
        onUpdate();
      }
      console.log("Sosyal Medya Profili Silindi:", account);
    } catch (error) {
      console.error("Silme hatası:", error);
    }
  };

  return (
    <>
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
                  <input
                    type="text"
                    value={account?.platform || ""}
                    id="platform"
                    className="focus:outline-none border border-gray-200 rounded-md p-2 w-full h-10 bg-gray-100"
                    readOnly
                    disabled
                  />
                </div>

                <div className="flex flex-col gap-1 text-sm">
                  <label htmlFor="username">Kullanıcı Adı</label>
                  <input
                    type="text"
                    value={updateAccountData?.username || ""}
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
                        (updateAccountData?.username || "").length >
                        limits.username * 0.8
                          ? "text-orange-500"
                          : ""
                      }
                    >
                      {(updateAccountData?.username || "").length}/
                      {limits.username}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 text-sm">
                  {/* Otomatik URL önizlemesi */}
                  {account?.platform && updateAccountData?.username && (
                    <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded-md">
                      <strong>Önizleme:</strong>{" "}
                      {generatePreviewUrl(
                        account.platform,
                        updateAccountData.username
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      const newIsPublic = !updateAccountData?.isPublic;
                      const newAccountData = {
                        ...updateAccountData,
                        isPublic: newIsPublic,
                      };
                      setUpdateAccountData(newAccountData);
                      checkForChanges(newAccountData);
                    }}
                    className={`w-5 h-5 flex items-center justify-center border rounded focus:outline-none transition-colors ${
                      updateAccountData?.isPublic
                        ? "bg-blue-600 border-blue-600"
                        : "bg-white border-gray-300"
                    }`}
                    aria-pressed={updateAccountData?.isPublic}
                  >
                    {updateAccountData?.isPublic ? (
                      <span className="w-3 h-3 bg-white rounded block" />
                    ) : (
                      <span className="w-3 h-3 bg-gray-300 rounded block" />
                    )}
                  </button>
                  <span
                    className="cursor-pointer select-none"
                    onClick={() => {
                      const newIsPublic = !updateAccountData?.isPublic;
                      const newAccountData = {
                        ...updateAccountData,
                        isPublic: newIsPublic,
                      };
                      setUpdateAccountData(newAccountData);
                      checkForChanges(newAccountData);
                    }}
                  >
                    {updateAccountData?.isPublic
                      ? "Profilde gösteriliyor"
                      : "Profilden gizli"}
                  </span>
                </div>

                {error && (
                  <div className="text-red-500 text-xs p-2 bg-red-50 rounded-md">
                    Güncelleme sırasında bir hata oluştu. Lütfen tekrar deneyin.
                  </div>
                )}
              </div>
            </div>
            <div className="w-full flex items-center justify-between px-10 py-5">
              <a
                href={account?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
              >
                <BsBoxArrowUpRight className="text-sm" />
              </a>

              <div className="w-full flex items-center justify-end gap-2">
                <button
                  onClick={() => setDeleteCheck(true)}
                  className="border text-white rounded-md px-4 py-2 text-xs cursor-pointer bg-red-500 hover:bg-red-400 transition-colors"
                >
                  Bağlantıyı Sil
                </button>
                <button
                  onClick={() => setEditSettings(false)}
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
        </div>
      )}
      {deleteCheck && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-xs z-150">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
            <h3 className="text-lg font-semibold mb-4">Bağlantıyı Sil</h3>
            <p>
              Bu sosyal medya bağlantısını silmek istediğinize emin misiniz?
            </p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setDeleteCheck(false)}
                className="border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-md px-4 py-2 mr-2 transition-all cursor-pointer"
              >
                İptal
              </button>
              <button
                onClick={() => handleDelete()}
                className="bg-red-500 text-white rounded-md px-4 py-2 transition-all hover:bg-red-400 cursor-pointer"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditAccounts;
