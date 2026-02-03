import api from "../config";

export interface LoginData {
  mail: string;
  password: string;
}

export const LoginService = async (data: LoginData) => {
  try {
    const response = await api.post("/users/login", data, {
      withCredentials: true, // Cookie'leri otomatik handle et
    });
    return response;
  } catch (error) {
    console.error("Kullanıcı giriş işlemi sırasında hata - service:", error);
    throw error; // Hatanın çağıran tarafından ele alınabilmesi için yeniden fırlatılıyor
  }
};
