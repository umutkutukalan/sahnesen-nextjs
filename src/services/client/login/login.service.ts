import api from "../config";

export interface LoginData {
  identifier: string; // Backend artık email veya username ile girişe izin veriyor
  password: string;
}

export const LoginService = async (data: LoginData) => {
  try {
    const response = await api.post("/api/auth/login", data, {
      withCredentials: true, // Cookie'leri otomatik handle et
    });
    return response;
  } catch (error) {
    console.error("Kullanıcı giriş işlemi sırasında hata - service:", error);
    throw error; // Hatanın çağıran tarafından ele alınabilmesi için yeniden fırlatılıyor
  }
};
