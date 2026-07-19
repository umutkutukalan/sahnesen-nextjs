"use client";

import { useAuth } from "@/context/UserContext";
import { useSidebar } from "@/context/SidebarContext";
import { useState } from "react";
import { BiBookmarkAlt } from "react-icons/bi";
import { IoSparklesOutline } from "react-icons/io5";
import { LuTheater } from "react-icons/lu";
import { RiUser6Line } from "react-icons/ri";
import { SiWikibooks } from "react-icons/si";
import StickySiteRules from "../PageStickyExtra/StickySiteRules";
import Notebook from "../PageStickyExtra/Notebook";
import LikedPost from "../PageStickyExtra/LikedPost";
import { FiUser, FiUsers } from "react-icons/fi";
import Image from "next/image";
import { useToProfile } from "@/utils/useToProfile";
import { TbRosetteDiscountCheckFilled } from "react-icons/tb";
import { useRelativeTime } from "@/hooks/useRelativeTime";
import Link from "next/link";

const Sidebar = () => {
  const { user } = useAuth();
  const { isSidebarOpen } = useSidebar();
  const { ToProfile } = useToProfile();
  const { formatRelativeTime } = useRelativeTime();

  const [selectedSideBarMenu, setSelectedSideBarMenu] = useState("Fuaye");

  const onSideBarMenuSelect = (menu: string) => {
    setSelectedSideBarMenu(menu);
  };

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  // Gelen string'in başında "/" yoksa, url birleştirirken çift slash olmaması için kontrol ediyoruz
  const userProfileImg = user?.profileImg
    ? user?.profileImg.startsWith("http")
      ? user?.profileImg
      : `${baseUrl}/${user?.profileImg}`
    : null;

  return (
    <aside
      className={`hidden lg:flex h-[calc(100vh-64px)] sticky top-16 flex-col justify-between bg-white z-80 transition-all duration-500 ease-in-out overflow-hidden ${
        isSidebarOpen
          ? "w-60 opacity-100 border-r border-gray-100 px-6 py-8"
          : "w-0 opacity-0 border-r-0 px-0 py-8 pointer-events-none"
      }`}
    >
      <div className="w-48 h-full flex flex-col justify-between gap-4 flex-shrink-0">
        <div className="flex flex-col gap-5">
          <div className="border-b border-gray-100 pb-10">
            {user ? (
              <ul className="flex flex-col gap-5">
                <Link
                  href={`/`}
                  className={`flex items-center gap-4 cursor-pointer transition-colors ${selectedSideBarMenu === "Fuaye" ? "text-black font-medium" : "text-gray-500 hover:text-black"}`}
                  onClick={() => onSideBarMenuSelect("Fuaye")}
                >
                  <LuTheater className="text-[22px]" />
                  <span className="text-[15px]">Fuaye</span>
                </Link>
                <li
                  className={`flex items-center gap-4 cursor-pointer transition-colors ${selectedSideBarMenu === "Sahnelerim" ? "text-black font-medium" : "text-gray-500 hover:text-black"}`}
                  onClick={() => onSideBarMenuSelect("Sahnelerim")}
                >
                  <SiWikibooks className="text-[22px]" />
                  <span className="text-[15px]">Sahnelerim</span>
                </li>
                <Link
                  href={`/profile/${user?.username}`}
                  className={`flex items-center gap-4 cursor-pointer transition-colors ${selectedSideBarMenu === "Profil" ? "text-black font-medium" : "text-gray-500 hover:text-black"}`}
                  onClick={() => onSideBarMenuSelect("Profil")}
                >
                  <RiUser6Line className="text-[22px]" />
                  <span className="text-[15px]">Profil</span>
                </Link>
                <li
                  className={`flex items-center gap-4 cursor-pointer transition-colors ${selectedSideBarMenu === "Koleksiyon" ? "text-black font-medium" : "text-gray-500 hover:text-black"}`}
                  onClick={() => onSideBarMenuSelect("Koleksiyon")}
                >
                  <BiBookmarkAlt className="text-[22px]" />
                  <span className="text-[15px]">Koleksiyon</span>
                </li>
                <li
                  className={`flex items-center gap-4 cursor-pointer transition-colors ${selectedSideBarMenu === "Etki" ? "text-black font-medium" : "text-gray-500 hover:text-black"}`}
                  onClick={() => onSideBarMenuSelect("Etki")}
                >
                  <IoSparklesOutline className="text-[22px]" />
                  <span className="text-[15px]">Etki</span>
                </li>
              </ul>
            ) : (
              <div className="flex flex-col gap-4">
                <StickySiteRules user={user} />
              </div>
            )}
          </div>
          <ul className="flex flex-col gap-5">
            <li
              className={`flex items-center gap-4 cursor-pointer transition-colors ${selectedSideBarMenu === "Topluluk" ? "text-black font-medium" : "text-gray-500 hover:text-black"}`}
              onClick={() => onSideBarMenuSelect("Topluluk")}
            >
              <FiUsers className="text-[22px]" />
              <span className="text-[15px]">Topluluk</span>
            </li>
          </ul>
        </div>
        <ul className="flex flex-col gap-4 pt-5">
          <li>
            <Notebook />
          </li>
          <li>
            <LikedPost type="projects" />
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
