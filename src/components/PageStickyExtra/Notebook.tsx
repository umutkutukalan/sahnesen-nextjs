"use client";

import { SlNotebook } from "react-icons/sl";

const Notebook = () => {
  return (
    <div className="flex items-center gap-2 cursor-pointer group transition-all">
      <div className="w-10 h-10 rounded-md overflow-hidden border border-gray-400 flex items-center justify-center text-gray-500 group-hover:border-gray-200 text-gray-700 transition-all">
        <SlNotebook className="text-xl group-hover:rotate-12 group-hover:text-blue-700 transition-all duration-300" />
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-gray-600">Not Defteri</span>
        <span
          className="text-gray-400"
          style={{
            fontSize: "0.650rem",
          }}
        >
          Notlarınızı alın.
        </span>
      </div>
    </div>
  );
};

export default Notebook;
