import { useState } from "react";

interface ReportButtonProps {
  contentId: string;
  initialIsReported?: boolean; // Backend'den gelen başlangıç durumu (varsa)
}

export default function ReportButton({
  contentId,
  initialIsReported = false,
}: ReportButtonProps) {
  const [isReported, setIsReported] = useState<boolean>(initialIsReported);
  const [loading, setLoading] = useState<boolean>(false);

  const handleReport = async () => {
    if (isReported || loading) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId }),
      });

      if (response.ok) {
        // BAŞARILI: Sayfa yenilenmesini beklemeden state'i anında güncelliyoruz
        setIsReported(true);
      } else {
        // İsteğe bağlı: Zaten raporlandı hatası (örn: 409 Conflict) dönerse de state'i true yapabiliriz
        const data = await response.json();
        if (response.status === 409 || data.code === "ALREADY_REPORTED") {
          setIsReported(true);
        } else {
          // Diğer hatalar...
        }
      }
    } catch (error) {
      console.error("Raporlama hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleReport}
      disabled={isReported || loading}
      className={`px-4 py-2 rounded-md font-medium transition-colors ${
        isReported
          ? "bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-400"
          : "bg-red-600 text-white hover:bg-red-700"
      }`}
    >
      {loading
        ? "Gönderiliyor..."
        : isReported
          ? "Zaten raporladınız"
          : "Rapor Et"}
    </button>
  );
}
