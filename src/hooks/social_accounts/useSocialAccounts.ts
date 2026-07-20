import { useState, useCallback } from "react";
import {
  SocialAccount,
  SocialAccountData,
  socialAccountService,
  UpdateSocialAccountData,
} from "@/services/client/social_accounts/social_accounts.service";

export const useSocialAccount = () => {
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [publicSocialAccounts, setPublicSocialAccounts] = useState<
    SocialAccount[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getSocialAccounts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await socialAccountService.getSocialAccounts();
      setSocialAccounts(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching social accounts:", err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPublicSocialAccounts = useCallback(async (username: string) => {
    try {
      setIsLoading(true);
      const data = await socialAccountService.getPublicSocialAccounts(username);
      setPublicSocialAccounts(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching public social accounts:", err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSocialAccount = useCallback(
    async (socialData: SocialAccountData) => {
      try {
        setIsLoading(true);
        const data = await socialAccountService.createSocialAccount(socialData);
        setSocialAccounts((prev) => [...prev, data]);
        return data;
      } catch (err) {
        console.error("Error creating social account:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const updateSocialAccount = useCallback(
    async (
      platformId: number | string,
      updateData: UpdateSocialAccountData,
    ) => {
      try {
        setIsLoading(true);
        const data = await socialAccountService.updateSocialAccount(
          platformId,
          updateData,
        );
        setSocialAccounts((prev) =>
          prev.map((acc) => (acc.id === data.id ? data : acc)),
        );
        return data;
      } catch (err) {
        console.error("Error updating social account:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const deleteSocialAccount = useCallback(
    async (platformId: number | string) => {
      try {
        setIsLoading(true);
        await socialAccountService.deleteSocialAccount(platformId);
        setSocialAccounts((prev) =>
          prev.filter((acc) => String(acc.id) !== String(platformId)),
        );
      } catch (err) {
        console.error("Error deleting social account:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    socialAccounts,
    publicSocialAccounts,
    isLoading,
    error,
    getSocialAccounts,
    getPublicSocialAccounts,
    createSocialAccount,
    updateSocialAccount,
    deleteSocialAccount,
  };
};
