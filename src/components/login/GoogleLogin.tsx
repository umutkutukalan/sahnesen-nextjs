"use client";

import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from "@react-oauth/google";
import { useGoogleLoginHook } from "@/hooks/login/useGoogleLogin";

const GoogleLogin = () => {
  const { handleGoogleSuccess, loading } = useGoogleLoginHook();

  // @react-oauth/google kütüphanesinin sunduğu hook
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      // tokenResponse.access_token bize Google'ın access token'ını verir.
      // Bu token'ı kullanarak Google'ın kullanıcı bilgilerini (email, isim, fotoğraf) çekebilir
      // veya direkt backend'e gönderip backend'in Google API ile doğrulamasını sağlayabilirsin.

      try {
        // Google'ın userinfo endpoint'inden kullanıcının profil bilgilerini alalım:
        const userInfoRes = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          },
        );
        const googleUser = await userInfoRes.json();

        // Backend'e göndereceğimiz format (GoogleLoginRequest eşleniği)
        await handleGoogleSuccess({
          googleId: googleUser.sub,
          email: googleUser.email,
          name: googleUser.given_name,
          surname: googleUser.family_name,
          picture: googleUser.picture,
        });
      } catch (err) {
        console.error("Google kullanıcı bilgileri alınamadı:", err);
      }
    },
    onError: (error) => {
      console.error("Google Giriş Hatası:", error);
    },
  });

  return (
    <button
      type="button"
      onClick={() => login()}
      disabled={loading}
      className="cursor-pointer w-full bg-white py-3 px-5 text-black border border-gray-300 rounded-md hover:bg-gray-100 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
    >
      <FcGoogle className="text-lg" />
      <span className="text-sm font-medium">
        {loading ? "Giriş yapılıyor..." : "Google ile devam et"}
      </span>
    </button>
  );
};

export default GoogleLogin;
