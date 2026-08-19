import { getUserProfile } from "@/services/client/user/user.service";
import { useState, useCallback } from "react";

export const useGetUser = () => {
  const [profileUser, setProfileUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log("HOCA", profileUser);

  const getUser = useCallback(async (username: string) => {
    try {
      const userData = await getUserProfile(username);
      setProfileUser(userData);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { profileUser, getUser, setProfileUser, isLoading };
};
