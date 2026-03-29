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
}

interface UserProviderProps {
  children: ReactNode;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log("UserContext: Fetching user from cookie...");

        // Cookie-based authentication
        const response = await axios.get("http://localhost:8080/users/me", {
          withCredentials: true, // HttpOnly cookie gönder
        });

        console.log("UserContext: User data from cookie:", response.data);
        setUser(response.data); // ✅ User var = authenticated
      } catch (error) {
        console.error("UserContext: Kullanıcı alınamadı:", error);
        console.log("UserContext: Cookie authentication failed");
        setUser(null); // ❌ User yok = not authenticated
      } finally {
        console.log("UserContext: Loading finished");
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
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
