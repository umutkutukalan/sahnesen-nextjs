
// import GoogleLogin from "./GoogleLogin";

import { useLogin } from "@/hooks/login/useLogin";

const LoginTable = ( { onSuccess }: { onSuccess: () => void } ) => {
  const { login, setIdentifier, setPassword } = useLogin(onSuccess);
  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex flex-col gap-2 w-full">
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-black focus:outline-none focus:ring-0 focus:border-black transition-all duration-200 placeholder-gray-400"
          placeholder="Email veya Username"
          onChange={(e) => setIdentifier(e.target.value)}
        />
        <input
          type="password"
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-black focus:outline-none focus:ring-0 focus:border-black transition-all duration-200 placeholder-gray-400"
          placeholder="Sifre"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="cursor-pointer text-xs w-full flex justify-end">
          Şifremi Unuttum
        </button>
      </div>
      <button
        className="cursor-pointer w-full bg-black py-3 text-white rounded-md hover:bg-gray-800 transition-all duration-200 text-sm"
        onClick={() => login()}
      >
        Giris Yap
      </button>
      <div className="flex items-center justify-between gap-2 w-full">
        <span className="flex-1 h-px bg-gray-300 block"></span>
        <span className="text-xs text-gray-500 px-2">veya</span>
        <span className="flex-1 h-px bg-gray-300 block"></span>
      </div>
      {/* <GoogleLogin /> */}
    </div>
  );
};

export default LoginTable;
