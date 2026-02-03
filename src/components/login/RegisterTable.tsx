// import { useRegister } from "../../hooks/Login/useRegister";

import Agreements from "./Agreements";
import GoogleLogin from "./GoogleLogin";

const RegisterTable = () => {
//   const { register, setName, setSurname, setMail, setPassword } = useRegister();

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-black focus:outline-none focus:ring-0 focus:border-black transition-all duration-200 placeholder-gray-400"
            placeholder="İsim"
            // onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-black focus:outline-none focus:ring-0 focus:border-black transition-all duration-200 placeholder-gray-400"
            placeholder="Soyisim"
            // onChange={(e) => setSurname(e.target.value)}
          />
        </div>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-black focus:outline-none focus:ring-0 focus:border-black transition-all duration-200 placeholder-gray-400"
          placeholder="Email"
        //   onChange={(e) => setMail(e.target.value)}
        />
        <input
          type="password"
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-black focus:outline-none focus:ring-0 focus:border-black transition-all duration-200 placeholder-gray-400"
          placeholder="Sifre"
        //   onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Agreements agreement={"Açık Rıza Sözleşmesi"} />
        <Agreements agreement={"Kullanıcı Kayıt Sözleşmesi"} />
        <Agreements agreement={"KVKK"} />
      </div>
      <button
        className="cursor-pointer w-full bg-black py-3 text-white rounded-md hover:bg-gray-800 transition-all duration-200 text-sm"
        // onClick={() => register()}
      >
        Kaydol
      </button>
      <div className="flex items-center justify-between gap-2 w-full">
        <span className="flex-1 h-px bg-gray-300 block"></span>
        <span className="text-xs text-gray-500 px-2">veya</span>
        <span className="flex-1 h-px bg-gray-300 block"></span>
      </div>
      <GoogleLogin />
    </div>
  );
};

export default RegisterTable;
