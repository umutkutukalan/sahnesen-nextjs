"use client";

import api from "@/services/client/config";
import { usePathname, useRouter } from "next/navigation";
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

export interface UserMetrics {
  contentCount: number;
  totalReadingTime: number;
  followerCount: number;
  ticketedShowCount: number;
  totalLightCount: number;
  totalSignatureCount: number;
  profileViews: number;
  reputationScore: number;
  badges: string[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  surname: string;
  bio: string;
  slug: string;
  profileImg: string;
  coverImg: string;
  role: string;
  metrics: UserMetrics | null;
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
  metrics: UserMetrics | null;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/api/users/me`, {
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
  }, []);

  const logout = async () => {
    try {
      setIsLoggingOut(true); // Çıkış sürecini başlat (loading aktif)
      await api.post(`/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error("Çıkış yapılırken hata oluştu:", error);
    } finally {
      setUser(null);
      localStorage.clear();
      setIsLoggingOut(false);
      // Sadece "/" dışında bir yerdeysek client-side yönlendir; reload YOK

      if (pathname !== "/") {
        router.replace("/");
      }
    }
  };

  return (
    <UserContext.Provider
      value={{ user, setUser, loading, logout, isLoggingOut }}
    >
      {children}
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
