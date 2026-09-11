"use client";

import api from "@/services/client/config";
import axios from "axios";
import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface UserContextType {
  user: User | null;
  setUser: Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  logout: () => Promise<void>;
  isLoggingOut: boolean;
}

interface UserProviderProps {
  children: ReactNode;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  surname: string;
  slug: string;
  profileImg: string;
  coverImg: string;
  role: string;
}

export interface PublicUser {
  id: number;
  username: string;
  name: string;
  surname: string;
  slug: string;
  profileImg: string;
  coverImg: string;
  bio: string;
  motto: string;
  city: string;
  district: string;
  role: string;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`${baseUrl}/api/users/me`, {
          withCredentials: true,
        });
        setUser(response.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [baseUrl]);

  const logout = async () => {
    try {
      setIsLoggingOut(true); // Çıkış sürecini başlat (loading aktif)
      await api.post(
        `${baseUrl}/auth/logout`, // Navbar'daki endpoint ile uyumlu hale getirildi
        {},
        { withCredentials: true },
      );
    } catch (error) {
      console.error("Çıkış yapılırken hata oluştu:", error);
    } finally {
      setUser(null);
      localStorage.clear();
      // Kısa bir gecikme ekleyerek kullanıcının akıcı bir geçiş görmesini sağlıyoruz
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  };

  return (
    <UserContext.Provider
      value={{ user, setUser, loading, logout, isLoggingOut }}
    >
      {children}
      {/* Çıkış yapılırken gösterilecek şık bir tam ekran yüklenme katmanı */}
      {isLoggingOut && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[99999] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-medium text-gray-600">
              Oturum kapatılıyor...
            </p>
          </div>
        </div>
      )}
    </UserContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useAuth must be used within a UserProvider");
  }
  return context;
};
