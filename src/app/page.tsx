"use client"; // client component olması lazım

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
// import LoginPage from "./login/login-page";
// import { useUser } from "@/context/UserContext";

import { ressam, runner, walker } from "../utils/";

const Home = () => {
  // const { user } = useUser();
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleClick = () => {
    setShowLoginModal(true);
  };

  return (
    <div className="relative">
      <nav className="fixed top-0 left-0 w-full text-black z-10 md:px-20 sm:px-10 px-5 py-5 2xl:py-10">
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
      <div className="min-h-screen w-full flex items-center overflow-hidden relative md:px-20 sm:px-10 px-5 bg-[#F7F4EA]">
        <div className="flex-1 h-screen w-full flex flex-col justify-between">
          <div className="w-full flex items-center 2xl:justify-start h-full z-100">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col font-quicksand text-[clamp(3rem,5vw,6rem)] 2xl:text-7xl leading-[clamp(3.5rem,6vw,5rem)]">
                <h1 className="bg-gradient-to-r from-[#1a1a1a] to-[#064232] text-transparent bg-clip-text">
                  Sahnedeysen
                </h1>
                <h1 className="bg-gradient-to-r from-[#1a1a1a] to-[#064232] text-transparent bg-clip-text">
                  sahnesen.
                </h1>
              </div>
              <div className="text-sm 2xl:text-3xl sm:w-120 w-60 2xl:w-250">
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
        <div className="flex-1 sm:block hidden z-20">
          <div className="relative lg:right-0 md:right-10 sm:right-20 right-0">
            <div className="absolute -top-30 2xl:-top-40 2xl:left-20 xl:left-30 lg:left-25 -translate-y-1/2 2xl:h-180 h-[clamp(300px,32vw,450px)] 2xl:w-full w-[clamp(600px,80vh,1000px)] rounded-xl overflow-hidden shadow-md shadow-black/70 rotate-15">
              <div className="absolute inset-0 bg-black opacity-70"></div>
              <Image
                src={ressam}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -top-5 2xl:-top-20 2xl:-left-40 xl:-left-15 lg:left-20 -translate-y-1/2 2xl:h-100 2xl:w-150 h-[clamp(300px,10vw,700px)] w-[clamp(400px,10vh,600px)] rounded-xl overflow-hidden shadow-md shadow-black/70 z-10 rotate-40 sm:block hidden">
              <div className="absolute inset-0 bg-black/50 opacity-70"></div>
              <Image
                src={walker}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute top-40 2xl:top-60 xl:left-30 lg:left-40 -translate-y-1/2 2xl:h-180 h-[clamp(350px,32vw,400px)] 2xl:w-full w-[clamp(600px,80vh,1000px)] rounded-xl overflow-hidden shadow-md shadow-black/70 -rotate-10 z-50">
              <div className="absolute inset-0 bg-black/50 opacity-20"></div>
              <Image
                src={runner}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </div>
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
