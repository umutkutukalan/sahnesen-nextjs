"use client"; // client component olması lazım

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
// import LoginPage from "./login/login-page";
// import { useUser } from "@/context/UserContext";

const Home = () => {
  // const { user } = useUser();
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleClick = () => {
    setShowLoginModal(true);
  };

  return (
    <div className="relative">
      <nav className="fixed top-0 left-0 w-full text-black z-10 px-20 py-5 2xl:py-10">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-1 2xl:text-4xl">
            <span>sahnesen</span>
          </div>
          <div className="flex items-center gap-3 text-xs 2xl:text-2xl text-black">
            <button
              className="px-3 py-1 border rounded-md cursor-pointer"
              onClick={handleClick}
            >
              Giriş Yap
            </button>
            <button className="px-4 py-1 border rounded-md cursor-pointer">
              Kaydol
            </button>
          </div>
        </div>
      </nav>
      <div className="min-h-screen w-full flex items-center overflow-hidden relative px-20 bg-[#F7F4EA]">
        <div className="flex-1 h-screen w-full flex flex-col justify-between">
          <div className="w-full flex items-center 2xl:justify-start h-full">
            <div className="flex flex-col gap-5">
              <div>
                <div className="text-7xl 2xl:text-[120px]">
                  <h1 className="font-quicksand">
                    <span className="bg-gradient-to-r from-[#1a1a1a] to-[#064232] text-transparent bg-clip-text">
                      Sahnedeysen
                    </span>
                    ,{" "}
                    <span className="bg-gradient-to-r from-[#1a1a1a] to-[#064232] text-transparent bg-clip-text">
                      sahnesen
                    </span>
                    .
                  </h1>
                </div>
              </div>
              <div className="text-sm 2xl:text-3xl w-120 2xl:w-250">
                <p className="text-gray-500 font-quicksand">
                  Çalışmalarını paylaş, hobilerini anlat, başkalarının
                  sahnelerine konuk ol. Çünkü burada herkesin bir sahnesi var
                </p>
              </div>
            </div>
          </div>
          <ul className="w-full flex items-center gap-3 pb-5 text-xs 2xl:text-xl text-gray-500">
            <li className="cursor-pointer hover:text-black transition-all">
              Yardım
            </li>
            <li className="cursor-pointer hover:text-black transition-all">
              Hakkımızda
            </li>
            <li className="cursor-pointer hover:text-black transition-all">
              Kurallar
            </li>
            <li className="cursor-pointer hover:text-black transition-all">
              Gizlilik
            </li>
          </ul>
        </div>
      </div>
      {/* {showLoginModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-[9999]">
          <LoginPage setShowLoginModal={setShowLoginModal} />
        </div>
      )} */}
    </div>
  );
};

export default Home;
