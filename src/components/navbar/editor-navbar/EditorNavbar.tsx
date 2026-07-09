import { useAuth } from "@/context/UserContext";
import NavLinks from "../NavbarLinks";
import { useEffect, useState } from "react";
import { FiUser } from "react-icons/fi";
import { RiComputerFill } from "react-icons/ri";
import { IoIosPaper } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getProfileAccountWithUser } from "@/constants";
import axios from "axios";
import { FaRegUser } from "react-icons/fa6";
import { CiLogout } from "react-icons/ci";

interface EditorNavbarProps {
  transparent: boolean;
  contentStatus: string;
  activePostId: number | null;
  handleSave: () => void;
}

const EditorNavbar = ({
  transparent,
  contentStatus,
  activePostId,
  handleSave,
}: EditorNavbarProps) => {
  const { user, setUser } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notification, setNotification] = useState(false);

  const iconMap = {
    FiUser: FiUser,
    RiComputerFill: RiComputerFill,
    IoIosPaper: IoIosPaper,
    IoSettingsOutline: IoSettingsOutline,
  };

  const renderIcon = (iconName: keyof typeof iconMap) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent /> : <FiUser />;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileMenu && !event.target.closest(".profile-menu-container")) {
        setShowProfileMenu(false);
      }
      if (notification && !event.target.closest(".notification-container")) {
        setNotification(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu, notification]);

  const handleLogout = async () => {
    try {
      console.log("Logout işlemi başlatılıyor...");
      console.log("Logout öncesi cookies:", document.cookie);

      const response = await axios.post(
        "http://localhost:8080/auth/logout",
        {},
        {
          withCredentials: true, // Cookie'leri gönder
        },
      );
      setUser(null);

      console.log("Logout sonrası cookies:", document.cookie);

      // 1 saniye bekleyip sayfayı yenile
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error) {
      console.error("Logout failed:", error);

      // Hata olsa bile local state'i temizle
      localStorage.removeItem("user");
      localStorage.clear();
      setUser(null);

      // Sayfayı yenile
      window.location.href = "/";
    }
  };

  const pathname = usePathname();

  const isHome = pathname === "/";
  const isProfilePage = pathname.startsWith("/profil");

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  // Gelen string'in başında "/" yoksa, url birleştirirken çift slash olmaması için kontrol ediyoruz
  const profileImgUrl = user?.profileImg
    ? user.profileImg.startsWith("http")
      ? user.profileImg
      : `${baseUrl}/${user.profileImg}`
    : null;

  return (
    <>
      <nav
        className={`editor-navbar py-4 lg:px-40 px-6 z-50 ${
          transparent && isHome
            ? "bg-transparent text-black shadow-none static py-12 px-20"
            : transparent && !isHome
              ? "bg-transparent text-white shadow-none static py-12 px-20"
              : "text-black bg-white fixed top-0 left-0 w-full z-50"
        }`}
      >
        <>
          <div className="flex items-top gap-2 text-black">
            <div className="text-3xl playfair-display-600">
              <NavLinks href="/" logo="Sahnesen" />
            </div>
            <div className="flex items-center gap-4 text-sm font-light">
              <h3>Sahne</h3>
              {/* 🔥 GÜVENLİ VE ŞIK BULUT DURUMU */}
              <div className="transition-all duration-300">
                {contentStatus === "SAVING" && <span>Saving...</span>}
                {contentStatus === "SAVED" && (
                  <span className="text-green-800 flex items-center gap-1.5 font-medium">
                    Saved
                  </span>
                )}
                {contentStatus === "ERROR" && (
                  <span className="text-rose-500 font-medium">Save Failed</span>
                )}
                {contentStatus === "IDLE" && activePostId && (
                  <span className="text-gray-300">Değişiklik bekleniyor</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2  overflow-hidden">
            <button
              className={`bg-green-800 text-xs text-white py-1 px-3 rounded-xl ${!activePostId ? "opacity-50" : "hover:bg-green-700 cursor-pointer"}`}
              disabled={!activePostId}
              onClick={handleSave}
            >
              Publish
            </button>
            <ul className="navbar-links">
              {!user && (
                <button
                  className={`transition-all text-sm pl-2 text-xs cursor-pointer ${
                    isProfilePage
                      ? "text-white hover:text-gray-100"
                      : "text-black hover:text-gray-600"
                  }`}
                  onClick={() => setShowLoginModal(true)}
                >
                  Giris Yap
                </button>
              )}
              {user && (
                <div className="flex items-center md:gap-4 gap-2 relative">
                  {/* <div className="relative">
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
                      {unreadCount}
                    </span>
                  )}
                  <div className="notification-container">
                    <GoBellFill
                      className="cursor-pointer"
                      onClick={() => setNotification(!notification)}
                    />
                  </div>
                  {notification && (
                    <NotificationsForUser
                      notification={notification}
                      setNotification={setNotification}
                    />
                  )}
                </div> */}
                  <div
                    className={`relative w-8 h-8 rounded-full overflow-hidden flex items-end justify-center cursor-pointer border border-gray-600  ${
                      profileImgUrl && "border border-gray-300"
                    }`}
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                  >
                    {profileImgUrl ? (
                      <Image
                        src={profileImgUrl}
                        alt="profile-img"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <FaRegUser
                        className={`text-xl ${
                          isProfilePage ? "text-white" : "text-gray-500"
                        }`}
                      />
                    )}
                  </div>
                  {showProfileMenu && !isProfilePage ? (
                    <div className="absolute top-8 -right-2 bg-white text-black rounded-lg shadow-lg p-3 w-55 z-50 profile-menu-container">
                      {getProfileAccountWithUser(user).map((item) => (
                        <Link
                          href={item.href}
                          key={item.title}
                          className="w-full p-3 text-left text-sm flex items-center gap-3 cursor-pointer hover:text-gray-600"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <span className="text-lg">
                            {renderIcon(item.icon)}
                          </span>
                          <p className="">{item.title}</p>
                        </Link>
                      ))}
                      <button
                        className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 cursor-pointer hover:text-gray-600"
                        onClick={handleLogout}
                      >
                        <CiLogout />
                        Çıkış Yap
                      </button>
                    </div>
                  ) : (
                    showProfileMenu &&
                    isProfilePage && (
                      <>
                        {/* Üçgen pointer */}
                        <div className="absolute top-12 right-2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white"></div>
                        <div className="absolute top-14 -right-5 bg-white text-black rounded-lg shadow-lg p-3 w-55 z-50 profile-menu-container">
                          {getProfileAccountWithUser(user).map((item) => (
                            <Link
                              href={item.href}
                              key={item.title}
                              className="w-full p-3 text-left text-sm flex items-center gap-3 cursor-pointer hover:text-gray-600"
                              onClick={() => setShowProfileMenu(false)}
                            >
                              <span className="text-lg">
                                {renderIcon(item.icon)}
                              </span>
                              <p className="">{item.title}</p>
                            </Link>
                          ))}
                          <button
                            className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 cursor-pointer hover:text-gray-600"
                            onClick={handleLogout}
                          >
                            <CiLogout />
                            Çıkış Yap
                          </button>
                        </div>
                      </>
                    )
                  )}
                </div>
              )}
            </ul>
          </div>
        </>
      </nav>
    </>
  );
};

export default EditorNavbar;
