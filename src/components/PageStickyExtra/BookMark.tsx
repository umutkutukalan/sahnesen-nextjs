"use client";

import { IoBookmarkOutline } from "react-icons/io5";

const BookMark = () => {
  return (
    <div className="flex items-center gap-2 cursor-pointer group transition-all">
      <div className="w-10 h-10 rounded-md overflow-hidden border border-gray-400 flex items-center justify-center text-gray-500 group-hover:border-gray-200 text-gray-700 transition-all">
        <IoBookmarkOutline className="text-xl group-hover:-rotate-5 group-hover:text-green-600 transition-all duration-300" />
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-gray-600">Kaydedilenler</span>
        <span
          className="text-gray-400"
          style={{
            fontSize: "0.650rem",
          }}
        >
          Kaydettiğiniz yazılara hızlıca ulaşın
        </span>
      </div>
    </div>
  );
};

export default BookMark;
