"use client";

import { FaTicketSimple } from "react-icons/fa6";
import { FiGlobe, FiUsers } from "react-icons/fi";

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
    <div className="w-full relative flex flex-col border-b border-gray-100 sticky top-[64px] bg-white z-20">
      {/* 1. ANA AKIŞ SEÇİCİ (Genel Akış / Takip Ettiklerin) */}
      <div className="w-full flex items-center gap-6 pt-3 px-1 border-b border-gray-100">
        <button
          type="button"
          className={`pb-2 flex items-center gap-1.5 cursor-pointer transition-all text-xs font-semibold ${
            feedScope === "all"
              ? "border-b-2 border-black text-black"
              : "text-gray-400 hover:text-black"
          }`}
          onClick={() => onSelectFeedScope("all")}
        >
          <FiGlobe className="text-sm" />
          <span>Genel Akış</span>
        </button>

        <button
          type="button"
          className={`pb-2 flex items-center gap-1.5 cursor-pointer transition-all text-xs font-semibold ${
            feedScope === "following"
              ? "border-b-2 border-black text-black"
              : "text-gray-400 hover:text-black"
          }`}
          onClick={() => onSelectFeedScope("following")}
        >
          <FiUsers className="text-sm" />
          <span>Takip Ettiklerin</span>
        </button>
      </div>

      {/* 2. İÇERİK TÜRÜ FİLTRELERİ (Tümü, Sahne, Monolog vb.) */}
      <div className="w-full h-14 flex items-end justify-between">
        <ul className="w-full flex items-end gap-6 overflow-x-auto scrollbar-hide">
          <button
            type="button"
            className={`pb-3 flex items-center gap-1.5 cursor-pointer transition-all ${
              selectedType === undefined
                ? "border-b-2 border-black font-medium"
                : "opacity-70 hover:opacity-100"
            }`}
            onClick={() => onSelectType(undefined)}
          >
            <span className="text-xs">Tümü</span>
          </button>

          <button
            type="button"
            className={`pb-3 flex items-center gap-1.5 cursor-pointer transition-all ${
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
            className={`pb-3 flex items-center gap-1.5 cursor-pointer transition-all ${
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
            className={`pb-3 flex items-center gap-1.5 cursor-pointer transition-all ${
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
            className={`pb-3 flex items-center gap-1.5 cursor-pointer transition-all ${
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
