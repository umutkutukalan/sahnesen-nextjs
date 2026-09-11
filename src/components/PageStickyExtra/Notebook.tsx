"use client";

import { PiNotebook } from "react-icons/pi";

const Notebook = () => {
  return (
    <div className="flex items-center gap-4 cursor-pointer text-gray-500 hover:text-black">
      <PiNotebook className="text-[22px]" />
      <span className="text-[15px]">Not Defteri</span>
    </div>
  );
};

export default Notebook;
