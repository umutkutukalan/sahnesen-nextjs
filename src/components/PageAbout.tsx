"use client";

import { FaTicketSimple } from "react-icons/fa6";
import { LiaTheaterMasksSolid } from "react-icons/lia";
import { TbTheater } from "react-icons/tb";

interface PageAboutProps {
  feedScope: "all" | "following";
  onSelectFeedScope: (scope: "all" | "following") => void;
  selectedType: string | undefined;
  onSelectType: (type: string | undefined) => void;
}

const PageAbout = ({
  feedScope,
  onSelectFeedScope,
  selectedType,
  onSelectType,
}: PageAboutProps) => {
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
      style={{
        height: "64px",
      }}
    >
      {/* 1. ANA AKIŞ SEÇİCİ (Genel Akış / Takip Ettiklerin) */}
      <div className="w-full flex items-center gap-6 pt-3 px-1">
        <button
          type="button"
          className={`pb-4 flex items-center gap-1.5 cursor-pointer transition-all ${
            feedScope === "all" ? "border-b-2 border-black text-black" : ""
          }`}
          onClick={() => onSelectFeedScope("all")}
        >
          <TbTheater className="text-xl" />
          <span className="text-xs">Fuaye</span>
        </button>

        <button
          type="button"
          className={`pb-4 flex items-center gap-1.5 cursor-pointer transition-all ${
            feedScope === "following"
              ? "border-b-2 border-black text-black"
              : ""
          }`}
          onClick={() => onSelectFeedScope("following")}
        >
          <LiaTheaterMasksSolid className="text-xl" />
          <span className="text-xs">Sahnemdekiler</span>
        </button>
      </div>

      {/* 2. İÇERİK TÜRÜ FİLTRELERİ (Tümü, Sahne, Monolog vb.) */}
      <div className="w-full relative h-14 flex items-end justify-between">
        <ul className="w-full relative z-50 flex items-end justify-end gap-6 overflow-x-auto scrollbar-hide">
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
              borderColor: selectedType === "SAHNE" ? "#c86b5a" : undefined,
            }}
            onClick={() => handleSelectType("SAHNE")}
          >
            <FaTicketSimple className="text-lg" style={{ color: "#c86b5a" }} />
            <span className="text-xs">Sahne</span>
          </button>

          <button
            type="button"
            className={`pb-4 flex items-center gap-1.5 cursor-pointer transition-all ${
              selectedType === "MONOLOG" ? "border-b-2 font-medium" : ""
            }`}
            style={{
              borderColor: selectedType === "MONOLOG" ? "#66788a" : undefined,
            }}
            onClick={() => handleSelectType("MONOLOG")}
          >
            <FaTicketSimple className="text-lg" style={{ color: "#66788a" }} />
            <span className="text-xs">Monolog</span>
          </button>

          <button
            type="button"
            className={`pb-4 flex items-center gap-1.5 cursor-pointer transition-all ${
              selectedType === "YANYANA" ? "border-b-2 font-medium" : ""
            }`}
            style={{
              borderColor: selectedType === "YANYANA" ? "#789680" : undefined,
            }}
            onClick={() => handleSelectType("YANYANA")}
          >
            <FaTicketSimple className="text-lg" style={{ color: "#789680" }} />
            <span className="text-xs">Yan Yana</span>
          </button>

          <button
            type="button"
            className={`pb-4 flex items-center gap-1.5 cursor-pointer transition-all ${
              selectedType === "TERSYUZ" ? "border-b-2 font-medium" : ""
            }`}
            style={{
              borderColor: selectedType === "TERSYUZ" ? "#fdfd96" : undefined,
            }}
            onClick={() => handleSelectType("TERSYUZ")}
          >
            <FaTicketSimple className="text-lg" style={{ color: "#fdfd96" }} />
            <span className="text-xs">Tersyüz</span>
          </button>
        </ul>
      </div>
    </div>
  );
};

export default PageAbout;
