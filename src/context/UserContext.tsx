"use client";

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
  user: any;
  setUser: Dispatch<React.SetStateAction<any>>;
  loading: boolean;
  logout: () => Promise<void>;
}

interface UserProviderProps {
  children: ReactNode;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/users/me`, {
          withCredentials: true,
        });

        setUser(response.data);
      } catch (error: any) {
        // Oturum süresi dolduğunda veya yetkisiz erişimde state sıfırlanır
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [baseUrl]);

  const logout = async () => {
    try {
      await axios.post(
        `${baseUrl}/api/auth/logout`,
        {},
        { withCredentials: true },
      );
    } catch (error) {
      console.error("Çıkış yapılırken hata oluştu:", error);
    } finally {
      setUser(null);
      window.location.href = "/login";
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, loading, logout }}>
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
