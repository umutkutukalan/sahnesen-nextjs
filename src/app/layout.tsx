import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";
import { SidebarProvider } from "@/context/SidebarContext";
import QueryProvider from "@/providers/QueryProvider";
import ScrollToTop from "@/components/ScrollToTop";
import { NotificationProvider } from "@/context/NotificationContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AppProviders from "@/components/providers/AppProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sahnesen",
  description: "Sahnesen",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <GoogleOAuthProvider
            clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}
          >
            <UserProvider>
              <SidebarProvider>
                <NotificationProvider>
                  <ScrollToTop />
                  <AppProviders>{children}</AppProviders>
                </NotificationProvider>
              </SidebarProvider>
            </UserProvider>
          </GoogleOAuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
