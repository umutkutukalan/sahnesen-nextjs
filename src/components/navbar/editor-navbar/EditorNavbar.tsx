import { useAuth } from "@/context/UserContext";
import NavLinks from "../NavbarLinks";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getProfileAccountWithUser } from "@/constants";
import { FaRegUser } from "react-icons/fa6";
import { CiLogout, CiSettings } from "react-icons/ci";
import { getFullImageUrl } from "@/utils/image";

interface EditorNavbarProps {
  transparent: boolean;
  contentStatus: string;
  activePostId: number | null;
  postSlug: string | null;
  postType?: string;
  isArchived?: boolean;
  isPublished?: boolean;
  onUpdatePost?: () => void;
}

const EditorNavbar = ({
  transparent,
  contentStatus,
  activePostId,
  postSlug,
  postType,
  isArchived = false,
  isPublished = false,
  onUpdatePost,
}: EditorNavbarProps) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notification, setNotification] = useState(false);

  // const iconMap = {
  //   FiUser: FiUser,
  //   RiComputerFill: RiComputerFill,
  //   IoIosPaper: IoIosPaper,
  //   IoSettingsOutline: IoSettingsOutline,
  // };

  // const renderIcon = (iconName: keyof typeof iconMap) => {
  //   const IconComponent = iconMap[iconName];
  //   return IconComponent ? <IconComponent /> : <FiUser />;
  // };

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

  const pathname = usePathname();
  const isHome = pathname === "/";
  const isProfilePage = pathname?.startsWith("/profil");

  return (
    <nav
      className={`editor-navbar py-12 px-20 lg:px-40 px-6 z-50 w-full fixed top-0 left-0 shadow-none static`}
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
          {!isArchived && (
            <>
              {isPublished ? (
                /* EĞER YAZI ZATEN YAYINDAYSA: "Sahneyi Güncelle" Butonu -> Publish sayfasına yönlendirir */
                <button
                  className={`bg-black text-xs text-white py-1.5 px-4 rounded-xl transition-all ${
                    !activePostId || !postSlug || contentStatus === "SAVING"
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-800 cursor-pointer shadow-sm"
                  }`}
                  disabled={
                    !activePostId || !postSlug || contentStatus === "SAVING"
                  }
                  onClick={() => {
                    if (postSlug) {
                      router.push(`/olustur/publish/${postSlug}`);
                    }
                  }}
                >
                  Sahneyi Güncelle
                </button>
              ) : (
                /* Taslak ise normal "Sahnele" butonu */
                <button
                  className={`${
                    postType === "SAHNE"
                      ? "bg-[#f18fa0] hover:bg-[#D95F6E]"
                      : postType === "MONOLOG"
                        ? "bg-[#9dce9d] hover:bg-[#78A578]"
                        : postType === "YANYANA"
                          ? "bg-[#91c5e5] hover:bg-[#70A8D1]"
                          : postType === "TERSYUZ"
                            ? "bg-[#f5d35e] hover:bg-[#e8b32d]"
                            : "border border-black"
                  } text-xs ${postType ? "text-white" : "hidden text-black"} py-2 px-4 rounded-full transition-all ${
                    !activePostId || !postSlug
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer shadow-sm"
                  }`}
                  disabled={
                    !activePostId || !postSlug || contentStatus === "SAVING"
                  }
                  onClick={() => {
                    if (postSlug) {
                      router.push(`/olustur/publish/${postSlug}`);
                    }
                  }}
                >
                  Sahnele
                </button>
              )}
            </>
          )}

          <ul className="navbar-links flex items-center">
            {!user && (
              <button
                className={`transition-all text-sm cursor-pointer ${
                  isProfilePage
                    ? "text-white hover:text-gray-100"
                    : "text-black hover:text-gray-600"
                }`}
              >
                Giriş Yap
              </button>
            )}
            {user && (
              <div className="flex items-center md:gap-4 gap-2 relative profile-menu-container">
                <div
                  className={`relative w-8 h-8 rounded-full overflow-hidden flex items-end justify-center cursor-pointer border border-black ${
                    !user.profileImg && "border border-gray-300"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowProfileMenu((prev) => !prev);
                  }}
                >
                  {user.profileImg ? (
                    <Image
                      src={getFullImageUrl(user.profileImg)!}
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

                {showProfileMenu && (
                  <div
                    className={`absolute ${
                      isProfilePage ? "top-14 -right-5" : "top-12 -right-2"
                    } bg-white text-black rounded-lg shadow-lg w-64 z-50 border border-gray-100 flex flex-col p-2`}
                  >
                    {/* ÜST KISIM: Aktif Kullanıcı Bilgisi */}
                    <div className="flex flex-col hover:bg-gray-100 rounded-lg gap-3 cursor-pointer">
                      <div
                        onClick={() => {
                          router.push(`/profil/${user.username}`);
                          setShowProfileMenu(false);
                        }}
                        className="flex items-center gap-3 p-3"
                      >
                        <div className="relative w-11 h-11 rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-gray-200">
                          {user.profileImg ? (
                            <Image
                              src={getFullImageUrl(user.profileImg)!}
                              alt="profile-img"
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <FaRegUser className="text-xl text-gray-500" />
                          )}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {user.name} {user.surname}
                          </p>
                          <span className="text-xs text-gray-500 truncate">
                            @{user.username}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ORTA KISIM: Profil Menü Linkleri */}
                    <div className="flex flex-col py-1 mt-1 border-t border-gray-100">
                      {getProfileAccountWithUser(user).map((item) => (
                        <Link
                          href={item.href}
                          key={item.title}
                          className="w-full px-3 py-2.5 text-left text-xs font-medium text-gray-700 flex items-center gap-3 rounded-xl hover:bg-gray-100 transition cursor-pointer"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <span className="text-base text-gray-500">
                            <CiSettings className="text-xl" />
                          </span>
                          <p>{item.title}</p>
                        </Link>
                      ))}
                    </div>

                    {/* ALT KISIM: Çıkış Yap */}
                    <div className="pt-1 border-t border-gray-100">
                      <button
                        className="w-full px-3 py-2.5 text-left text-xs font-medium text-red-600 flex items-center gap-3 rounded-xl hover:bg-red-50 transition cursor-pointer"
                        onClick={() => {
                          setShowProfileMenu(false);
                          logout();
                        }}
                      >
                        <CiLogout className="text-xl" />
                        <span>Çıkış Yap</span>
                      </button>
                    </div>
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
