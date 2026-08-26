"use client";

import { IoIosPaper } from "react-icons/io";
import { FaRegUser } from "react-icons/fa6";
import { RiComputerFill, RiMenu4Line } from "react-icons/ri";
import { CiLogout } from "react-icons/ci";
import { FiUser } from "react-icons/fi";
import { IoNotificationsOutline, IoSettingsOutline } from "react-icons/io5";
import axios from "axios";
import { useAuth } from "../../context/UserContext";
import { useSidebar } from "@/context/SidebarContext";
import { FiSearch } from "react-icons/fi";
import { useEffect, useState } from "react";
import Image from "next/image";
import NavLinks from "./NavbarLinks";
import { getProfileAccountWithUser } from "@/constants/index";
import Link from "next/link";
import LoginPage from "@/pages/LoginPage";
import { usePathname } from "next/navigation";
import { ImPencil2 } from "react-icons/im";

const Navbar = ({
  transparent,
  isProfile,
}: {
  transparent: boolean;
  isProfile?: boolean;
}) => {
  const { user, setUser } = useAuth();
  const { toggleSidebar, toggleProfileSidebar } = useSidebar();
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

  // Hamburger İkonu Tıklama Yönetimi
  const handleMenuClick = () => {
    // Mobil veya Tablet (lg öncesi) ekranlarda HER ZAMAN ProfileSidebar açılır
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      toggleProfileSidebar();
    } else {
      // Masaüstünde sayfanın türüne göre ilgili sidebar açılır
      if (isProfile) {
        toggleProfileSidebar();
      } else {
        toggleSidebar();
      }
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8080/auth/logout",
        {},
        { withCredentials: true },
      );
      setUser(null);
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.removeItem("user");
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
    <>
      <nav
        className={`navbar md:py-4 py-10 pr-10 pl-6 ${
          transparent && isHome
            ? "bg-transparent text-black shadow-none static py-12 px-20"
            : transparent && !isHome
              ? "bg-transparent text-white shadow-none static py-12 px-20"
              : "text-black bg-white border-b border-gray-200 fixed top-0 left-0 w-full z-50"
        }`}
      >
        <>
          <div className="flex items-center gap-4">
            {/* Tıklama mantığı güncellenen menü ikonu */}
            <RiMenu4Line
              className="text-2xl cursor-pointer"
              onClick={handleMenuClick}
            />
            <li className={`list-none`}>
              <Link
                href={"/"}
                className={`text-black transition-all duration-100`}
              >
                <span className="text-3xl merriweather-sans font-semibold tracking-tighter select-none">
                  <span className="inline-block italic -rotate-6 transform transition-transform duration-300 origin-bottom">
                    S
                  </span>
                  ahne
                  <span className="">s</span>
                  en
                </span>
              </Link>
            </li>
          </div>

          <div className="flex items-center gap-2 border-gray-200 border rounded-lg overflow-hidden lg:block hidden">
            <div className="relative rounded-2xl overflow-hidden">
              <div className="absolute top-1/2 left-6 -translate-y-1/2 -translate-x-1/2 transform z-20">
                <FiSearch className="text-xl" />
              </div>
              <input
                type="text"
                placeholder="Ara..."
                className="xl:w-180 lg:w-120 focus:outline-none pl-12 pr-5 py-1 text-sm relative z-10 text-lg select-none"
              />
            </div>
          </div>
          <ul className="navbar-links">
            {user && user.role === "ADMIN" && (
              <div className="text-xl">
                <NavLinks href="/create" logo={<ImPencil2 />} />
              </div>
            )}
            <div className="text-xl">
              <NavLinks href="/" logo={<IoNotificationsOutline />} />
            </div>
            {!user && (
              <button
                className={`transition-all text-sm cursor-pointer ${
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
                <div
                  className={`relative w-8 h-8 rounded-full overflow-hidden flex items-end justify-center cursor-pointer border border-black ${
                    !user.profileImg && "border border-gray-300"
                  }`}
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  {user.profileImg ? (
                    <Image
                      src={profileImgUrl}
                      alt="profile-img"
                      fill
                      className="object-cover"
                      unoptimized
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
                        <span className="text-lg">{renderIcon(item.icon)}</span>
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
        </>
      </nav>
      {showLoginModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-[9999]">
          <LoginPage setShowLoginModal={setShowLoginModal} />
        </div>
      )}
    </>
  );
};

export default Navbar;
