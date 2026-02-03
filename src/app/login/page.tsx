"use client";
import LoginTable from "@/components/login/LoginTable";
import RegisterTable from "@/components/login/RegisterTable";
import { loginpageimg } from "@/utils";
import Image from "next/image";
import { useState } from "react";
import { FaFireFlameCurved } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";

export interface LoginPageProps {
  setShowLoginModal: (value: boolean) => void;
}

const LoginPage = ({ setShowLoginModal }: LoginPageProps) => {
  const [sign, setSign] = useState(true);
  const [register, setRegister] = useState(false);

  const handleSign = () => {
    setSign(true);
    setRegister(false);
  };
  const handleRegister = () => {
    setSign(false);
    setRegister(true);
  };

  return (
    <div className="h-180 w-280 bg-white rounded-lg flex overflow-hidden shadow-lg relative">
      <div
        className="absolute left-2 top-2 text-2xl text-gray-500 hover:text-gray-700 cursor-pointer"
        onClick={() => setShowLoginModal(false)}
      >
        <IoClose className="text-sm" />
      </div>
      <div className="flex-1 w-full h-full py-10 flex flex-col justify-between items-center">
        <div className="flex items-center gap-1">
          <FaFireFlameCurved />
          <h1 className="text-center">sahnesen</h1>
        </div>
        <div className="flex flex-col w-full justify-center items-center gap-2">
          <div className="flex flex-col items-center text-sm gap-2 w-100">
            <p className="text-2xl text-center w-full mb-2">
              {sign ? "Giriş Yap" : "Kaydol"}
            </p>
            <div className="flex items-center gap-2 w-full bg-gray-200 rounded-md p-1">
              <button
                className={`flex-1 px-8 py-2 
              rounded-sm cursor-pointer ${sign ? "bg-white" : ""} `}
                onClick={() => handleSign()}
              >
                Giris Yap
              </button>
              <button
                className={`flex-1 px-8 py-2 rounded-sm cursor-pointer ${
                  register ? "bg-white" : ""
                }`}
                onClick={() => handleRegister()}
              >
                Kaydol
              </button>
            </div>
            {sign && <LoginTable />}
            {register && <RegisterTable />}
          </div>
        </div>
        <div
          className="text-center w-full px-10"
          style={{
            fontSize: "0.7rem",
            color: "#6b7280",
          }}
        >
          <p>
            <button className="text-blue-500">kutukalan</button> , fikirlerini
            paylaşan, sesini duyuran, çizgilerle düş kuranların dijital durağı.
            Giriş yaparak yazılım projelerini inceleyebilir, blogları
            okuyabilir, müzikleri dinleyebilir, çizerlerin kitaplarında
            kaybolabilirsin.
          </p>
        </div>
      </div>
      <div className="flex-1 w-full h-full">
        <Image
          src={loginpageimg}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default LoginPage;
