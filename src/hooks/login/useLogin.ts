import { useState } from "react";
import { useUser } from "../../context/UserContext";
import { LoginService } from "@/services/login/loginService";

export const useLogin = () => {
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useUser(); // setToken'ı kaldırdık

  const data = {
    mail,
    password,
  };

  const login = async () => {
    if (!mail || !password) {
      alert("Email ve şifre boş olamaz!");
      return;
    }
    try {
      const response = await LoginService(data);
      console.log("Kullanıcı giriş yaptı:", response.data);

      // Backend HttpOnly cookie olarak token ayarlıyor
      // Sadece user bilgisini UserContext'e kaydet
      setUser(response.data.user);

      console.log("Login başarılı - Cookie ile authentication aktif");

      // Giriş başarılıysa sayfayı yenile
      window.location.reload();
    } catch (error) {
      console.error("Kullanıcı girişi sırasında hata - hooks:", error);
      console.log("Giriş verileri:", data);
      alert("Giriş işlemi başarısız. Lütfen bilgilerinizi kontrol edin.");
    }
  };

  return { login, setMail, setPassword, mail, password };
};
