import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { RegisterData, RegisterService } from "@/services/client/login/register.service";


export const useRegister = () => {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useUser();

  const data: RegisterData = {
    name,
    surname,
    mail,
    password,
  };

  console.log("Register data", data);

  const register = async () => {
    try {
      const response = await RegisterService(data);
      setUser(response.data.user);
      window.location.href = "/";
      console.log("Kayıt başarılı:", response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return { register, setName, setSurname, setMail, setPassword };
};
