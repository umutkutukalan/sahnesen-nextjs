import { FcGoogle } from "react-icons/fc";
// import { useGoogleLogin } from "../../hooks/Login/useGoogleLogin";

const GoogleLogin = () => {
//   const { user, setUser, handleGoogleLogin, handleLogout } = useGoogleLogin();
  return (
    <button
      className="cursor-pointer w-full bg-white py-3 px-5 text-black border rounded-md hover:bg-gray-100 transition-all duration-200 flex items-center justify-center gap-2"
    //   onClick={handleGoogleLogin}
    >
      <FcGoogle className="text-lg" />
      <p className="text-sm">Google ile devam et</p>
    </button>
  );
};

export default GoogleLogin;
