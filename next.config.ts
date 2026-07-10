import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 127.0.0.1 ve localhost gibi lokal IP'lerden resim çekilmesine izin verir
    dangerouslyAllowSVG: true, // Eğer resimler SVG ise veya bazen yerel isteklerde Next.js bunu şart koşar

    // Bazı Next.js versiyonlarında lokal ağ güvenliğini esnetmek için remotePatterns yerine bu da gerekebilir:
    unoptimized: process.env.NODE_ENV === "development", // Geliştirme ortamında (localhost) resim optimizasyonunu kapatır, böylece doğrudan resmi basar. En temiz çözümdür!

    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/profileImgs/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/coverImgs/**",
      },
    ],
  },
};

export default nextConfig;
