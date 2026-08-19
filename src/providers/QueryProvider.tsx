"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // QueryClient'ı useState ile sarmalayarak her render'da yeniden oluşturulmasını önlüyoruz
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // Veri 5 dakika taze kalır (gereksiz API isteği atmaz)
            refetchOnWindowFocus: false, // Sekme değiştirdiğinde otomatik istek atmasını engeller
            retry: 1, // Hata durumunda 1 kez daha dener
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
