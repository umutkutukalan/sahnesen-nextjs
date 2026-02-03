import api from "../config";

export interface RegisterData {
    name: string;
    surname: string;
    mail: string;
    password: string;
}

export const RegisterService = async (data: RegisterData) => {
  try {
    const response = await api.post("/users/register", data);
    return response;
  } catch (error) {
    console.error("Kullanıcı kaydedilirken hata - service:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};
