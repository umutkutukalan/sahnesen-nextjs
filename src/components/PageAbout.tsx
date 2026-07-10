import { sagperde } from "@/utils";
import Image from "next/image";
import { useState } from "react";
import { FaTicketSimple } from "react-icons/fa6";

const PageAbout = ({ pageTitle, contentType }) => {
  const [selectedButton, setSelectedButton] = useState(null);

  const selectButton = (button) => {
    setSelectedButton((prev) => (prev === button ? null : button));
  };

  return (
    <div className="w-full relative flex items-start">
      <div className="w-full h-18 flex items-end justify-between sticky top-[64px] z-20 border-b border-gray-100">
        <ul className="w-full flex items-end gap-8 text-gray-600">
          <button
            className={`pb-3 flex items-center gap-1.5 cursor-pointer ${selectedButton === "SAHNE" ? "border-b border-gray-500" : ""}`}
            onClick={() => selectButton("SAHNE")}
          >
            <FaTicketSimple className={`text-xl text-black`} />
            <span className="text-xs">Sahne</span>
          </button>
          <button
            className={`pb-3 flex items-center gap-1.5 cursor-pointer ${selectedButton === "MONOLOG" ? "border-b border-gray-500" : ""}`}
            onClick={() => selectButton("MONOLOG")}
          >
            <FaTicketSimple className={`${"text-xl text-[#f3c102]"}`} />
            <span className="text-xs">Monolog</span>
          </button>
          <button
            className={`pb-3 flex items-center gap-1.5 cursor-pointer ${selectedButton === "YANYANA" ? "border-b border-gray-500" : ""}`}
            onClick={() => selectButton("YANYANA")}
          >
            <FaTicketSimple className={`${"text-xl text-[#fa9ec1]"}`} />
            <span className="text-xs">Yan Yana</span>
          </button>
          <button
            className={`pb-3 flex items-center gap-1.5 cursor-pointer ${selectedButton === "TERSYUZ" ? "border-b border-gray-500" : ""}`}
            onClick={() => selectButton("TERSYUZ")}
          >
            <FaTicketSimple className={`${"text-xl text-[#94c5fd]"}`} />
            <span className="text-xs">Tersyüz</span>
          </button>
          <button
            className={`pb-3 flex items-center gap-1.5 cursor-pointer ${selectedButton === "ETUT" ? "border-b border-gray-500" : ""}`}
            onClick={() => selectButton("ETUT")}
          >
            <FaTicketSimple className={`${"text-xl text-[#f79293]"}`} />
            <span className="text-xs">Etüt</span>
          </button>
        </ul>
      </div>
    </div>
  );
};

export default PageAbout;
