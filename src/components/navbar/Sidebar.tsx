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

const Sidebar = () => {
  const { user } = useAuth();
  const { isSidebarOpen } = useSidebar();

  const [selectedSideBarMenu, setSelectedSideBarMenu] = useState("Fuaye");

  const onSideBarMenuSelect = (menu: string) => {
    setSelectedSideBarMenu(menu);
  };

  return (
    <aside
      className={`relative hidden lg:flex h-[calc(100vh-64px)] top-16 flex-col justify-between bg-white z-80 transition-all duration-500 ease-in-out overflow-hidden ${
        isSidebarOpen
          ? "w-60 opacity-100 border-r border-gray-100 px-6 py-8"
          : "w-0 opacity-0 border-r-0 px-0 py-8 pointer-events-none"
      }`}
    >
      <div className="w-48 h-full flex flex-col justify-between gap-4 flex-shrink-0">
        <div className="border-b border-gray-100 pb-10">
          {user ? (
            <ul className="flex flex-col gap-5">
              <li
                className={`flex items-center gap-4 cursor-pointer transition-colors ${selectedSideBarMenu === "Fuaye" ? "text-black font-medium" : "text-gray-500 hover:text-black"}`}
                onClick={() => onSideBarMenuSelect("Fuaye")}
              >
                <LuTheater className="text-[22px]" />
                <span className="text-[15px]">Fuaye</span>
              </li>
              <li
                className={`flex items-center gap-4 cursor-pointer transition-colors ${selectedSideBarMenu === "Yazılarım" ? "text-black font-medium" : "text-gray-500 hover:text-black"}`}
                onClick={() => onSideBarMenuSelect("Yazılarım")}
              >
                <SiWikibooks className="text-[22px]" />
                <span className="text-[15px]">Yazılarım</span>
              </li>
              <li
                className={`flex items-center gap-4 cursor-pointer transition-colors ${selectedSideBarMenu === "Profil" ? "text-black font-medium" : "text-gray-500 hover:text-black"}`}
                onClick={() => onSideBarMenuSelect("Profil")}
              >
                <RiUser6Line className="text-[22px]" />
                <span className="text-[15px]">Profil</span>
              </li>
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
