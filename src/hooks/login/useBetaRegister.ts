import { useState } from "react";
import { useAuth } from "@/context/UserContext";
import {
  RegisterData,
  RegisterService,
} from "@/services/client/login/register.service";

export const useBetaRegister = (onSuccess: (username?: string) => void) => {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setMail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState(""); // Davet kodu state'i
  const { setUser } = useAuth();

  const data: RegisterData = {
    name,
    surname,
    email,
    username,
    password,
    inviteCode, // Backend'e giden payload'a eklendi
  };

  console.log("Beta Register data", data);

  const register = async () => {
    try {
      const response = await RegisterService(data);
      setUser(response.data.user);

      // Doğrudan dönen verideki username'i parametre olarak veriyoruz
      if (onSuccess) {
        onSuccess(response.data.user?.username);
      }
    } catch (error) {
      console.error("Beta Kayıt Hatası:", error);
    }
  };

  return {
    register,
    setName,
    setUsername,
    setSurname,
    setMail,
    setPassword,
    setInviteCode,
    inviteCode,
  };
};
