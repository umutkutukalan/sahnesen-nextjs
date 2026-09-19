import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/client/config";
import { useAuth } from "@/context/UserContext";

export const useGoogleLoginHook = () => {
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const router = useRouter();

  const handleGoogleSuccess = async (googleResponseData: any) => {
    setLoading(true);
    try {
      // Backend'e token veya kullanıcı bilgilerini gönderiyoruz
      const response = await api.post("/api/auth/google", googleResponseData, {
        withCredentials: true,
      });

      setUser(response.data.user);
      router.push("/"); // Ana sayfaya veya profile yönlendir
    } catch (error) {
      console.error("Google giriş hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  return { handleGoogleSuccess, loading };
};
