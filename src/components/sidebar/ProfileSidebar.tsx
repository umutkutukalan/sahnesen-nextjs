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
import { FiUsers } from "react-icons/fi";
import Link from "next/link";

const ProfileSidebar = () => {
  const { user } = useAuth();
  const { isProfileSidebarOpen, setProfileSidebarOpen } = useSidebar();

  const [selectedSideBarMenu, setSelectedSideBarMenu] = useState("Fuaye");

  const onSideBarMenuSelect = (menu: string) => {
    setSelectedSideBarMenu(menu);
    setProfileSidebarOpen(false);
  };

  const onClose = () => {
    setProfileSidebarOpen(false);
  };

  return (
    <>
      <div
        className={`fixed inset-0 top-16 bg-black/40 z-40 transition-opacity z-100 duration-300 ${
          isProfileSidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Responsive Sidebar Paneli */}
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-64px)] flex flex-col justify-between bg-white z-100 transition-all duration-300 overflow-y-auto ${
          isProfileSidebarOpen
            ? "w-64 opacity-100 border-r border-gray-100 px-6 py-8 translate-x-0 shadow-xl lg:shadow-none"
            : "w-0 opacity-0 border-r-0 px-0 py-8 -translate-x-full lg:translate-x-0 pointer-events-none"
        }`}
      >
        <div className="w-52 h-full flex flex-col justify-between gap-4 flex-shrink-0">
          <div className="flex flex-col gap-5">
            <div className="border-b border-gray-100 pb-10">
              {user ? (
                <ul className="flex flex-col gap-5">
                  <Link
                    href={`/`}
                    className={`flex items-center gap-4 cursor-pointer transition-colors ${
                      selectedSideBarMenu === "Fuaye"
                        ? "text-black font-medium"
                        : "text-gray-500 hover:text-black"
                    }`}
                    onClick={() => onSideBarMenuSelect("Fuaye")}
                  >
                    <LuTheater className="text-[22px]" />
                    <span className="text-[15px]">Fuaye</span>
                  </Link>
                  <Link
                    href={`/sahnelerim`}
                    className={`flex items-center gap-4 cursor-pointer transition-colors ${
                      selectedSideBarMenu === "Sahnelerim"
                        ? "text-black font-medium"
                        : "text-gray-500 hover:text-black"
                    }`}
                    onClick={() => onSideBarMenuSelect("Sahnelerim")}
                  >
                    <SiWikibooks className="text-[22px]" />
                    <span className="text-[15px]">Sahnelerim</span>
                  </Link>
                  <Link
                    href={`/profil/${user?.username}`}
                    className={`flex items-center gap-4 cursor-pointer transition-colors ${
                      selectedSideBarMenu === "Profil"
                        ? "text-black font-medium"
                        : "text-gray-500 hover:text-black"
                    }`}
                    onClick={() => onSideBarMenuSelect("Profil")}
                  >
                    <RiUser6Line className="text-[22px]" />
                    <span className="text-[15px]">Profil</span>
                  </Link>
                  <Link
                    href={`/koleksiyon`}
                    className={`flex items-center gap-4 cursor-pointer transition-colors ${
                      selectedSideBarMenu === "Koleksiyon"
                        ? "text-black font-medium"
                        : "text-gray-500 hover:text-black"
                    }`}
                    onClick={() => onSideBarMenuSelect("Koleksiyon")}
                  >
                    <BiBookmarkAlt className="text-[22px]" />
                    <span className="text-[15px]">Koleksiyon</span>
                  </Link>
                  <Link
                    href={`/etki`}
                    className={`flex items-center gap-4 cursor-pointer transition-colors ${
                      selectedSideBarMenu === "Etki"
                        ? "text-black font-medium"
                        : "text-gray-500 hover:text-black"
                    }`}
                    onClick={() => onSideBarMenuSelect("Etki")}
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
              <Link
                href={`/topluluk`}
                className={`flex items-center gap-4 cursor-pointer transition-colors ${
                  selectedSideBarMenu === "Topluluk"
                    ? "text-black font-medium"
                    : "text-gray-500 hover:text-black"
                }`}
                onClick={() => onSideBarMenuSelect("Topluluk")}
              >
                <FiUsers className="text-[22px]" />
                <span className="text-[15px]">Topluluk</span>
              </Link>
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
    </>
  );
};

export default ProfileSidebar;
