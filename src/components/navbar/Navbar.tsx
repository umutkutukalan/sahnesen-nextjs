"use client";

import { IoIosPaper } from "react-icons/io";
import { FaRegUser } from "react-icons/fa6";
import {
  RiComputerFill,
  RiMenu4Line,
  RiNotification2Line,
} from "react-icons/ri";
import { CiLogout } from "react-icons/ci";
import { FiUser } from "react-icons/fi";
import { IoSettingsOutline } from "react-icons/io5";
import { PublicUser, useAuth } from "../../context/UserContext";
import { useSidebar } from "@/context/SidebarContext";
import { FiSearch } from "react-icons/fi";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import NavLinks from "./NavbarLinks";
import { getProfileAccountWithUser } from "@/constants/index";
import Link from "next/link";
import LoginPage from "@/pages/LoginPage";
import { usePathname, useRouter } from "next/navigation";
import { ImPencil2 } from "react-icons/im";
import {
  searchPostsClient,
  searchTagsClient,
} from "@/services/client/post.service";
import { searchUsersClient } from "@/services/client/user/user.service";
import { getFullImageUrl } from "@/utils/image";
import { PostSummaryResponse } from "@/services/server/post.service";
import { TagResponse } from "@/services/client/tags/tag.service";
import { LuImages } from "react-icons/lu";
import { useNotifications } from "@/context/NotificationContext";

const Navbar = ({
  transparent,
  isProfile,
}: {
  transparent: boolean;
  isProfile?: boolean;
}) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { toggleSidebar, toggleProfileSidebar } = useSidebar();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notification, setNotification] = useState(false);

  // Arama state'leri
  const [searchQuery, setSearchQuery] = useState("");
  const [postsResults, setPostsResults] = useState([]);
  const [tagsResults, setTagsResults] = useState([]);
  const [usersResults, setUsersResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const router = useRouter();

  const searchRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  // Kullanıcı yazdıkça tetiklenen arama efekti (Debounce ile)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        try {
          const [posts, tags, users] = await Promise.all([
            searchPostsClient(searchQuery),
            searchTagsClient(searchQuery),
            searchUsersClient(searchQuery),
          ]);
          setPostsResults(posts);
          setTagsResults(tags);
          setUsersResults(users);
          setIsSearchOpen(true);
        } catch (err) {
          console.error("Arama hatası:", err);
        }
      } else {
        setPostsResults([]);
        setTagsResults([]);
        setUsersResults([]);
        setIsSearchOpen(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Enter tuşuna basıldığında arama sonuç sayfasına yönlendirme
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/arama/posts?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (showProfileMenu && !target?.closest(".profile-menu-container")) {
        setShowProfileMenu(false);
      }
      if (notification && !target?.closest(".notification-container")) {
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

  const pathname = usePathname();
  const isHome = pathname === "/";
  const isProfilePage = pathname?.startsWith("/profil") ?? false;

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
            <ul className="flex items-center gap-6">
              <li className={`list-none`}>
                <Link
                  href={"/"}
                  className={`text-black transition-all duration-100`}
                >
                  <span className="text-3xl merriweather-sans font-semibold tracking-tighter select-none">
                    Sahnesen
                  </span>
                </Link>
              </li>

              <li
                ref={searchRef}
                className="relative flex items-center gap-2 border-gray-200 border rounded-lg overflow-visible lg:block hidden"
              >
                <div className="relative rounded-2xl">
                  <div className="absolute top-1/2 left-6 -translate-y-1/2 -translate-x-1/2 transform z-20">
                    <FiSearch className="text-xl text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      if (!isSearchOpen) setIsSearchOpen(true);
                      setSearchQuery(e.target.value);
                    }}
                    onFocus={() => {
                      // Tekrar input'a odaklanıldığında, eğer sonuç varsa dropdown'ı geri aç
                      if (
                        searchQuery.trim().length > 0 &&
                        (postsResults.length > 0 ||
                          tagsResults.length > 0 ||
                          usersResults.length > 0)
                      ) {
                        setIsSearchOpen(true);
                      }
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Ara..."
                    className="focus:outline-none pl-12 pr-5 py-1.5 text-sm relative z-10 text-lg select-none bg-transparent"
                    style={{ width: 300 }}
                  />
                </div>

                {/* AÇILIR DROPDOWN (Görseldeki Stil) */}
                {isSearchOpen &&
                  (postsResults.length > 0 ||
                    tagsResults.length > 0 ||
                    usersResults.length > 0) && (
                    <div
                      className="absolute top-12 left-0 flex flex-col gap-4 bg-white border border-gray-100 rounded-lg shadow-xl z-50 p-4 max-h-[480px] overflow-y-auto"
                      style={{ width: 300 }}
                    >
                      {/* USERS (Kullanıcılar / Yazarlar) */}
                      {usersResults.length > 0 && (
                        <div className="">
                          <div className="border-b border-gray-100 mb-2 mb-2">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
                              Kişiler
                            </h3>
                          </div>
                          {usersResults.map((u: PublicUser) => {
                            return (
                              <Link
                                key={u.id}
                                href={`/profil/${u.username}`}
                                onClick={() => setIsSearchOpen(false)}
                                className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <div className="relative w-7 h-7 rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-gray-200">
                                  {u.profileImg ? (
                                    <Image
                                      src={getFullImageUrl(u.profileImg)!}
                                      alt={u.username}
                                      fill
                                      className="object-cover"
                                      unoptimized
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-end justify-center">
                                      <FaRegUser className="text-gray-500 text-sm" />
                                    </div>
                                  )}
                                </div>
                                <div className="overflow-hidden">
                                  <p className="text-xs font-medium text-gray-800 truncate">
                                    {u.name} {u.surname}
                                  </p>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}

                      {/* PUBLICATIONS (Yazılar) */}
                      {postsResults.length > 0 && (
                        <div className="">
                          <div className="border-b border-gray-100 mb-2">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
                              İçerikler
                            </h3>
                          </div>
                          {postsResults.map((post: PostSummaryResponse) => (
                            <Link
                              key={post.id}
                              href={`/${post.authorUsername}/${post.slug}`}
                              onClick={() => setIsSearchOpen(false)}
                              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <div className="w-8 h-8 relative rounded-md flex items-center justify-center shrink-0">
                                {post.coverImage ? (
                                  <Image
                                    src={getFullImageUrl(post.coverImage)!}
                                    alt={post.title}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                    <LuImages className="text-lg text-gray-300" />
                                  </div>
                                )}
                              </div>
                              <div className="overflow-hidden">
                                <p className="text-xs text-gray-800 line-clamp-2">
                                  {post.title}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* TOPICS (Etiketler) */}
                      {tagsResults.length > 0 && (
                        <div className="">
                          <div className="border-b border-gray-100 mb-2">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
                              Etiketler
                            </h3>
                          </div>
                          {tagsResults.map((tag: TagResponse) => (
                            <Link
                              key={tag.id}
                              href={`/tag/${tag.name}`}
                              onClick={() => setIsSearchOpen(false)}
                              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-gray-500 text-sm font-serif">
                                #
                              </div>
                              <p className="text-xs font-medium text-gray-800">
                                {tag.name}
                              </p>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
              </li>
            </ul>
          </div>

          <ul className="navbar-links">
            {user && user.role === "ADMIN" && (
              <div className="text-[20px]">
                <NavLinks href="/olustur" logo={<ImPencil2 />} />
              </div>
            )}
            {user && (
              <div className="relative">
                {unreadCount > 0 && (
                  <div className="absolute -top-3 -right-2 min-w-[20px] min-h-[20px] bg-white rounded-sm flex items-center justify-center z-10">
                    <div className="w-[8px] px-2 min-h-[16px] rounded-sm bg-green-900 flex items-center justify-center">
                      <p className="text-white text-[10px] font-medium">
                        {unreadCount}
                      </p>
                    </div>
                  </div>
                )}
                <div className="text-[20px]">
                  <NavLinks
                    href="/bildirimler"
                    logo={<RiNotification2Line />}
                  />
                </div>
              </div>
            )}
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
                          {renderIcon(item.icon as keyof typeof iconMap)}
                        </span>
                        <p className="">{item.title}</p>
                      </Link>
                    ))}
                    <button
                      className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 cursor-pointer hover:text-gray-600"
                      onClick={logout}
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
                              {renderIcon(item.icon as keyof typeof iconMap)}
                            </span>
                            <p className="">{item.title}</p>
                          </Link>
                        ))}
                        <button
                          className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 cursor-pointer hover:text-gray-600"
                          onClick={logout}
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
