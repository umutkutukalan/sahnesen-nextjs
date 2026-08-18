"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useBetaRegister } from "@/hooks/login/useBetaRegister";
import Agreements from "./Agreements";

const BetaRegisterTable = ({
  onSuccess,
}: {
  onSuccess: (username?: string) => void;
}) => {
  const searchParams = useSearchParams();
  const codeFromUrl = searchParams.get("code");

  const {
    register,
    setName,
    setSurname,
    setMail,
    setPassword,
    setUsername,
    setInviteCode,
    inviteCode,
  } = useBetaRegister(onSuccess);

  // URL'de ?code=SAHNE-X8K2P9 varsa state'e otomatik aktarır
  useEffect(() => {
    if (codeFromUrl) {
      setInviteCode(codeFromUrl.toUpperCase());
    }
  }, [codeFromUrl, setInviteCode]);

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Kurucu Sahne VIP Karşılama Kartı */}
      <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-lg flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-amber-600 text-xs font-semibold px-2 py-0.5 bg-amber-500/20 rounded-full uppercase tracking-wider">
            Kurucu Sahne
          </span>
          <span className="text-xs text-amber-700 font-medium">
            Kapalı Beta Davetiyesi ✨
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Sahnesen’in ilk çekirdek topluluğuna davet edildiniz. Lütfen davet
          kodunuz ile kaydınızı tamamlayın.
        </p>
      </div>

      <div className="flex flex-col gap-2 w-full">
        {/* Davet Kodu Input'u */}
        <div className="relative">
          <input
            type="text"
            value={inviteCode}
            readOnly={!!codeFromUrl} // Eğer URL'den geldiyse kilitlenir, elle geldiyse yazılabilir
            className={`w-full border rounded-md px-3 py-2 text-black font-mono font-medium focus:outline-none transition-all duration-200 placeholder-gray-400 ${
              codeFromUrl
                ? "bg-gray-100 border-amber-500/50 cursor-not-allowed"
                : "bg-white border-gray-300 focus:border-black"
            }`}
            placeholder="Davet Kodu (Örn: SAHNE-XXXXXX)"
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
          />
          {codeFromUrl && (
            <span className="absolute right-3 top-2.5 text-xs text-emerald-600 font-medium flex items-center gap-1">
              ✓ Doğrulandı
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-black focus:outline-none focus:ring-0 focus:border-black transition-all duration-200 placeholder-gray-400"
            placeholder="İsim"
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-black focus:outline-none focus:ring-0 focus:border-black transition-all duration-200 placeholder-gray-400"
            placeholder="Soyisim"
            onChange={(e) => setSurname(e.target.value)}
          />
        </div>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-black focus:outline-none focus:ring-0 focus:border-black transition-all duration-200 placeholder-gray-400"
          placeholder="Kullanıcı Adı (@username)"
          onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
        />
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-black focus:outline-none focus:ring-0 focus:border-black transition-all duration-200 placeholder-gray-400"
          placeholder="Email"
          onChange={(e) => setMail(e.target.value)}
        />
        <input
          type="password"
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-black focus:outline-none focus:ring-0 focus:border-black transition-all duration-200 placeholder-gray-400"
          placeholder="Şifre"
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <Agreements agreement={"Açık Rıza Sözleşmesi"} />
        <Agreements agreement={"Kullanıcı Kayıt Sözleşmesi"} />
        <Agreements agreement={"KVKK"} />
      </div>

      <button
        className="cursor-pointer w-full bg-black py-3 text-white rounded-md hover:bg-gray-800 transition-all duration-200 text-sm font-medium"
        onClick={() => register()}
      >
        {"Kurucu Sahne'ye Kaydol"}
      </button>
    </div>
  );
};

export default BetaRegisterTable;
