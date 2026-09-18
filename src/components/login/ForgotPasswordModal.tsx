import { forgotPassword } from "@/services/client/login/auth.service";
import { useState } from "react";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal = ({
  isOpen,
  onClose,
}: ForgotPasswordModalProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      await forgotPassword(email);
      setSuccessMessage("E-Posta adresinize gönderilmiştir.");
      setEmail("");
    } catch (err: any) {
      setErrorMessage(err.message || "Bir hata oluştu, lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl flex flex-col gap-4 relative">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-black">
            Şifrenizi mi Unuttunuz?
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black cursor-pointer text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-gray-500">
          Kayıt olduğunuz e-posta adresinizi girin, size şifre sıfırlama
          bağlantısı gönderelim.
        </p>

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded text-xs">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-xs">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-black focus:outline-none focus:ring-0 focus:border-black text-sm"
            placeholder="E-posta adresiniz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer w-full bg-black py-2.5 text-white rounded-md hover:bg-gray-800 transition-all duration-200 text-sm disabled:opacity-50"
          >
            {loading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
          </button>
        </form>
      </div>
    </div>
  );
};
