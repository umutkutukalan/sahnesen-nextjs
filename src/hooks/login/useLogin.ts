import { useState } from "react";
import { useAuth } from "../../context/UserContext";
import { LoginService } from "@/services/client/login/login.service";

export const useLogin = (onSuccess?: () => void) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useAuth(); 

  const login = async () => {
    if (!identifier || !password) {
      alert("Email veya username ve şifre boş olamaz!");
      return;
    }
    
    try {
      // Backend HttpOnly cookie bastığı için burası credentials: true/include ile gitmeli
      const response = await LoginService({ identifier, password });
      
      /* Backend'den dönen user objesi artık yeni mimariyle uyumlu:
        { id: 1, username: "kutukalan", name: "Umut", surname: "Kütükalan", profileImg: null ... }
      */
      setUser(response.data.user);
      
      console.log("Giriş Başarılı! WebSocket bağlantıları başlatılıyor...");

      // Sert sayfa yenileme yerine modalı kapatacak callback'i tetikle
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Giriş hatası:", error);
      alert("Giriş işlemi başarısız. Bilgilerinizi kontrol edin.");
    }
  };

  return { login, setIdentifier, setPassword, identifier, password };
};
