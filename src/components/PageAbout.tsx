"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { FaTicketSimple } from "react-icons/fa6";
import { LiaTheaterMasksSolid } from "react-icons/lia";
import { TbTheater } from "react-icons/tb";

interface PageAboutProps {
  feedScope: "all" | "following";
  selectedType: string | undefined;
  onSelectType: (type: string | undefined) => void;
}

const PageAbout = ({
  feedScope,
  selectedType,
  onSelectType,
}: PageAboutProps) => {
  const pathname = usePathname();
  const isProfilePage = pathname?.includes("profil");

  const handleSelectType = (type: string) => {
    if (selectedType === type) {
      onSelectType(undefined);
    } else {
      onSelectType(type);
    }
  };

  return (
    <div
      className="w-full relative flex items-end justify-between border-b border-gray-100 bg-white"
      style={{ height: "64px" }}
    >
      {!isProfilePage && (
        <div className="w-full flex items-center gap-6 pt-3 px-1">
          {/* Fuaye Sekmesi */}
          <Link
            href="/"
            className={`pb-4 flex items-center gap-1.5 cursor-pointer transition-all ${
              feedScope === "all"
                ? "border-b-2 border-black text-black"
                : "text-gray-500 hover:text-black"
            }`}
          >
            <TbTheater className="text-xl" />
            <span className="text-xs">Fuaye</span>
          </Link>

          {/* Sahnemdekiler Sekmesi */}
          <Link
            href="/sahnemdekiler"
            className={`pb-4 flex items-center gap-1.5 cursor-pointer transition-all ${
              feedScope === "following"
                ? "border-b-2 border-black text-black"
                : "text-gray-500 hover:text-black"
            }`}
          >
            <LiaTheaterMasksSolid className="text-xl" />
            <span className="text-xs">Sahnemdekiler</span>
          </Link>
        </div>
      )}

      {/* İÇERİK TÜRÜ FİLTRELERİ (Tümü, Sahne, Monolog vb.) */}
      <div className="w-full relative h-14 flex items-end justify-between">
        <ul
          className={`w-full relative z-50 flex ${isProfilePage ? "justify-start" : "justify-end"} gap-6 overflow-x-auto scrollbar-hide`}
        >
          <button
            type="button"
            className={`pb-4 flex items-center gap-1.5 cursor-pointer transition-all ${
              selectedType === undefined
                ? "border-b-2 border-black font-medium"
                : ""
            }`}
            onClick={() => onSelectType(undefined)}
          >
            <span className="text-xs">Tümü</span>
          </button>

          <button
            type="button"
            className={`pb-4 flex items-center gap-1.5 cursor-pointer transition-all ${
              selectedType === "SAHNE" ? "border-b-2 font-medium" : ""
            }`}
            style={{
              borderColor: selectedType === "SAHNE" ? "#f18fa0" : undefined,
            }}
            onClick={() => handleSelectType("SAHNE")}
          >
            <FaTicketSimple className="text-lg" style={{ color: "#f18fa0" }} />
            <span className="text-xs">Sahne</span>
          </button>

          <button
            type="button"
            className={`pb-4 flex items-center gap-1.5 cursor-pointer transition-all ${
              selectedType === "MONOLOG" ? "border-b-2 font-medium" : ""
            }`}
            style={{
              borderColor: selectedType === "MONOLOG" ? "#9dce9d" : undefined,
            }}
            onClick={() => handleSelectType("MONOLOG")}
          >
            <FaTicketSimple className="text-lg" style={{ color: "#9dce9d" }} />
            <span className="text-xs">Monolog</span>
          </button>

          <button
            type="button"
            className={`pb-4 flex items-center gap-1.5 cursor-pointer transition-all ${
              selectedType === "YANYANA" ? "border-b-2 font-medium" : ""
            }`}
            style={{
              borderColor: selectedType === "YANYANA" ? "#91c5e5" : undefined,
            }}
            onClick={() => handleSelectType("YANYANA")}
          >
            <FaTicketSimple className="text-lg" style={{ color: "#91c5e5" }} />
            <span className="text-xs">Yan Yana</span>
          </button>

          <button
            type="button"
            className={`pb-4 flex items-center gap-1.5 cursor-pointer transition-all ${
              selectedType === "TERSYUZ" ? "border-b-2 font-medium" : ""
            }`}
            style={{
              borderColor: selectedType === "TERSYUZ" ? "#f5d35e" : undefined,
            }}
            onClick={() => handleSelectType("TERSYUZ")}
          >
            <FaTicketSimple className="text-lg" style={{ color: "#f5d35e" }} />
            <span className="text-xs">Tersyüz</span>
          </button>
        </ul>
      </div>
    </div>
  );
};

export default PageAbout;
