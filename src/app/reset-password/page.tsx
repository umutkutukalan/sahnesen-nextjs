"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword } from "@/services/client/login/auth.service";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMessage("Şifreler birbiriyle uyuşmuyor.");
      return;
    }

    if (!token) {
      setErrorMessage("Geçersiz veya eksik şifre sıfırlama tokeni.");
      return;
    }

    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      await resetPassword(token, newPassword);
      setSuccessMessage(
        "Şifreniz başarıyla güncellendi! Giriş sayfasına yönlendiriliyorsunuz...",
      );
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Şifre sıfırlama işlemi başarısız oldu.";
      setErrorMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-md flex flex-col gap-4">
        <h2 className="text-xl font-bold text-black text-center">
          Yeni Şifre Belirleme
        </h2>
        <p className="text-xs text-gray-500 text-center">
          Lütfen hesabınız için yeni şifrenizi girin.
        </p>

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded text-xs text-center">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-xs text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            required
            placeholder="Yeni Şifre"
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-black focus:outline-none focus:border-black text-sm"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            required
            placeholder="Yeni Şifre (Tekrar)"
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-black focus:outline-none focus:border-black text-sm"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer w-full bg-black py-3 text-white rounded-md hover:bg-gray-800 transition-all text-sm disabled:opacity-50 mt-2"
          >
            {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Next.js useSearchParams suspense wrap gereksinimi için:
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Yükleniyor...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
