"use client";

import { FaTicketSimple } from "react-icons/fa6";

interface PageAboutProps {
  selectedType: string | undefined;
  onSelectType: (type: string | undefined) => void;
}

const PageAbout = ({ selectedType, onSelectType }: PageAboutProps) => {
  const handleSelect = (type: string) => {
    // Aynı butona tekrar basılırsa filtreyi kaldırır (Tüm Gönderileri Getirir)
    if (selectedType === type) {
      onSelectType(undefined);
    } else {
      onSelectType(type);
    }
  };

  return (
    <div className="w-full relative flex items-start">
      <div className="w-full h-18 flex items-end justify-between sticky top-[64px] z-20 border-b border-gray-100">
        <ul className="w-full flex items-end gap-8">
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
            onClick={() => handleSelect("SAHNE")}
          >
            <FaTicketSimple className="text-xl" style={{ color: "#c86b5a" }} />
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
            onClick={() => handleSelect("MONOLOG")}
          >
            <FaTicketSimple className="text-xl" style={{ color: "#66788a" }} />
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
            onClick={() => handleSelect("YANYANA")}
          >
            <FaTicketSimple className="text-xl" style={{ color: "#789680" }} />
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
            onClick={() => handleSelect("TERSYUZ")}
          >
            <FaTicketSimple className="text-xl" style={{ color: "#fdfd96" }} />
            <span className="text-xs">Tersyüz</span>
          </button>
        </ul>
      </div>
    </div>
  );
};

export default PageAbout;
