"use client";

import { useAuth } from "@/context/UserContext";
import { useSidebar } from "@/context/SidebarContext";
import { LuTheater } from "react-icons/lu";
import { RiUser6Line } from "react-icons/ri";
import { SiWikibooks } from "react-icons/si";
import { BiBookmarkAlt } from "react-icons/bi";
import { IoSparklesOutline } from "react-icons/io5";
import Link from "next/link";
import { usePathname } from "next/navigation";
import StickySiteRules from "../PageStickyExtra/StickySiteRules";
import Notebook from "../PageStickyExtra/Notebook";
import CommunityFollows from "./CommunityFollows";
import { LiaTheaterMasksSolid } from "react-icons/lia";

const Sidebar = () => {
  const { user } = useAuth();
  const { isSidebarOpen } = useSidebar();
  const pathname = usePathname();

  // Aktif sekmeyi URL'e göre otomatik belirle (State sıfırlanma sorununu kökten çözer)
  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname?.startsWith(path)) return true;
    return false;
  };

  return (
    <aside
      className={`hidden lg:flex h-[calc(100vh-64px)] sticky top-16 flex-col justify-between bg-white z-40 transition-all duration-500 ease-in-out overflow-hidden shrink-0 ${
        isSidebarOpen
          ? "w-60 opacity-100 border-r border-gray-100 px-6 py-8"
          : "w-0 opacity-0 border-r-0 px-0 py-8 pointer-events-none"
      }`}
    >
      <div className="w-48 h-full flex flex-col justify-between gap-4 flex-shrink-0">
        <div className="flex flex-col gap-5">
          <div className="border-b border-gray-100 pb-6">
            {user ? (
              <ul className="flex flex-col gap-5">
                <Link
                  href={`/`}
                  className={`flex items-center gap-4 cursor-pointer transition-colors ${
                    isActive("/") && pathname === "/"
                      ? "text-black font-medium"
                      : "text-gray-500 hover:text-black"
                  }`}
                >
                  <LuTheater className="text-[22px]" />
                  <span className="text-[15px]">Fuaye</span>
                </Link>
                <Link
                  href={`/sahnelerim`}
                  className={`flex items-center gap-4 cursor-pointer transition-colors ${
                    isActive("/sahnelerim")
                      ? "text-black font-medium"
                      : "text-gray-500 hover:text-black"
                  }`}
                >
                  <SiWikibooks className="text-[22px]" />
                  <span className="text-[15px]">Sahnelerim</span>
                </Link>
                <Link
                  href={`/profil/${user?.username}`}
                  className={`flex items-center gap-4 cursor-pointer transition-colors ${
                    isActive("/profil")
                      ? "text-black font-medium"
                      : "text-gray-500 hover:text-black"
                  }`}
                >
                  <RiUser6Line className="text-[22px]" />
                  <span className="text-[15px]">Profil</span>
                </Link>
                <Link
                  href={`/koleksiyon`}
                  className={`flex items-center gap-4 cursor-pointer transition-colors ${
                    isActive("/koleksiyon")
                      ? "text-black font-medium"
                      : "text-gray-500 hover:text-black"
                  }`}
                >
                  <BiBookmarkAlt className="text-[22px]" />
                  <span className="text-[15px]">Koleksiyon</span>
                </Link>
                <Notebook />
                <Link
                  href={`/etki`}
                  className={`flex items-center gap-4 cursor-pointer transition-colors ${
                    isActive("/etki")
                      ? "text-black font-medium"
                      : "text-gray-500 hover:text-black"
                  }`}
                >
                  <IoSparklesOutline className="text-[22px]" />
                  <span className="text-[15px]">Etki</span>
                </Link>
              </ul>
            ) : (
              <div className="flex flex-col gap-4">
                <StickySiteRules user={user} />
              </div>
            )}
          </div>
          <ul className="flex flex-col gap-5">
            <li
              className={`flex items-center gap-4 cursor-pointer transition-colors ${
                isActive("/topluluk")
                  ? "text-black font-medium"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              <LiaTheaterMasksSolid className="text-[22px]" />
              <span className="text-[15px]">Sahnemdekiler</span>
            </li>
            {user && <CommunityFollows username={user.username} />}
          </ul>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
