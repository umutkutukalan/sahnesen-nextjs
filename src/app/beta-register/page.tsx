"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import BetaRegisterTable from "@/components/login/BetaRegisterTable";

export default function BetaRegisterPage() {
  const router = useRouter();
  const handleSuccess = (username?: string) => {
    router.push(`/profile/${username}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col gap-1 mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Sahnesen</h1>
          <p className="text-sm text-gray-500">
            Kurucu Sahne Özel Katılım Ekranı
          </p>
        </div>

        <Suspense
          fallback={
            <div className="text-center text-sm py-8 text-gray-400">
              Yükleniyor...
            </div>
          }
        >
          <BetaRegisterTable onSuccess={handleSuccess} />
        </Suspense>
      </div>
    </div>
  );
}
