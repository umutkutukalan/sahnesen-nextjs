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
  onOpenPublishModal: () => void;
}

const EditorNavbar = ({
  transparent,
  contentStatus,
  activePostId,
  onOpenPublishModal,
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
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showProfileMenu && !target.closest(".profile-menu-container")) {
        setShowProfileMenu(false);
      }
      if (notification && !target.closest(".notification-container")) {
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
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/auth/logout`,
        {},
        { withCredentials: true },
      );
      setUser(null);
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.clear();
      setUser(null);
      window.location.href = "/";
    }
  };

  const pathname = usePathname();
  const isHome = pathname === "/";
  const isProfilePage = pathname.startsWith("/profil");
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  const profileImgUrl = user?.profileImg
    ? user.profileImg.startsWith("http")
      ? user.profileImg
      : `${baseUrl}/${user.profileImg}`
    : null;

  return (
    <nav
      className={`editor-navbar py-4 lg:px-40 px-6 z-50 ${
        transparent && isHome
          ? "bg-transparent text-black shadow-none static py-12 px-20"
          : transparent && !isHome
            ? "bg-transparent text-white shadow-none static py-12 px-20"
            : "text-black bg-white fixed top-0 left-0 w-full z-50"
      }`}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3 text-black">
          <div className="text-3xl playfair-display-600">
            <NavLinks
              href="/"
              logo={
                <span className="text-3xl merriweather-sans font-semibold tracking-tighter select-none">
                  <span className="inline-block italic -rotate-6 transform transition-transform duration-300 origin-bottom">
                    S
                  </span>
                  ahne
                  <span className="">s</span>
                  en
                </span>
              }
            />
          </div>
          <div className="flex items-center gap-4 text-sm font-light pointer-events-none">
            <h3>Sahne</h3>
            <div className="transition-all duration-300">
              {contentStatus === "SAVING" && (
                <span className="text-gray-400">Kaydediliyor...</span>
              )}
              {contentStatus === "SAVED" && (
                <span className="text-green-800 flex items-center gap-1.5 font-medium">
                  Kaydedildi
                </span>
              )}
              {contentStatus === "ERROR" && (
                <span className="text-rose-500 font-medium">
                  Kaydetme başarısız
                </span>
              )}
              {contentStatus === "IDLE" && activePostId && (
                <span className="text-gray-300">Değişiklik bekleniyor</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            className={`bg-green-800 text-xs text-white py-1.5 px-4 rounded-xl transition-all ${
              !activePostId
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-green-700 cursor-pointer shadow-sm"
            }`}
            disabled={!activePostId || contentStatus === "SAVING"}
            onClick={onOpenPublishModal}
          >
            Sahnele
          </button>

          <ul className="navbar-links flex items-center">
            {!user && (
              <button
                className={`transition-all text-sm cursor-pointer ${
                  isProfilePage
                    ? "text-white hover:text-gray-100"
                    : "text-black hover:text-gray-600"
                }`}
                onClick={() => setShowLoginModal(true)}
              >
                Giriş Yap
              </button>
            )}
            {user && (
              <div className="flex items-center gap-2 relative">
                <div
                  className={`relative w-8 h-8 rounded-full overflow-hidden flex items-center justify-center cursor-pointer border ${
                    profileImgUrl ? "border-gray-300" : "border-gray-600"
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
                      className={`text-sm ${isProfilePage ? "text-white" : "text-gray-500"}`}
                    />
                  )}
                </div>

                {showProfileMenu && (
                  <div className="absolute top-10 right-0 bg-white text-black rounded-lg shadow-lg p-3 w-52 z-50 profile-menu-container border border-gray-100">
                    {getProfileAccountWithUser(user).map((item) => (
                      <Link
                        href={item.href}
                        key={item.title}
                        className="w-full p-2.5 text-left text-sm flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-md transition-colors"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <span className="text-base">
                          {renderIcon(item.icon)}
                        </span>
                        <p>{item.title}</p>
                      </Link>
                    ))}
                    <button
                      className="w-full p-2.5 text-left text-sm flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-md transition-colors text-rose-600"
                      onClick={handleLogout}
                    >
                      <CiLogout className="text-base" />
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default EditorNavbar;
