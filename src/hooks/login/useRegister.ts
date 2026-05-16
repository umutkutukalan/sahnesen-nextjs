import { useState } from "react";
import { useAuth } from "@/context/UserContext";
import {
  RegisterData,
  RegisterService,
} from "@/services/client/login/register.service";

export const useRegister = (onSuccess: () => void) => {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setMail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useAuth();

  const data: RegisterData = {
    name,
    surname,
    email,
    username,
    password,
  };

  console.log("Register data", data);

  const register = async () => {
    try {
      const response = await RegisterService(data);
      setUser(response.data.user);
      onSuccess();
      console.log("Kayıt başarılı:", response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return { register, setName, setUsername, setSurname, setMail, setPassword };
};
