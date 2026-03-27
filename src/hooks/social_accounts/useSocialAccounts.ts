import { SocialAccountData, socialAccountService, UpdateSocialAccountData } from "@/services/client/social_accounts/social_accounts.service";
import { useState, useCallback } from "react";

export const useSocialAccount = (userId?: number | string) => {
    const [socialAccounts, setSocialAccounts] = useState([]);
    const [publicSocialAccounts, setPublicSocialAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const getSocialAccounts = useCallback(async (uid: number | string) => {
        try {
            setIsLoading(true);
            const data = await socialAccountService.getSocialAccounts(uid);
            setSocialAccounts(data || []);
        } catch (err) {
            console.error("Error fetching social accounts:", err);
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getPublicSocialAccounts = useCallback(async (uid: number | string) => {
        try {
            setIsLoading(true);
            const data = await socialAccountService.getPublicSocialAccounts(uid);
            console.log("UID:", uid);
            console.log("Fetched public social accounts:", data);
            setPublicSocialAccounts(data || []);
        } catch (err) {
            console.error("Error fetching public social accounts:", err);
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createSocialAccount = useCallback(async (uid: number | string, socialData: SocialAccountData) => {
        try {
            setIsLoading(true);
            const data = await socialAccountService.createSocialAccount(uid, socialData);
            setSocialAccounts(prev => [...prev, data]);
            return data;
        } catch (err) {
            console.error("Error creating social account:", err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateSocialAccount = useCallback(async (platformId: number | string, updateData: UpdateSocialAccountData) => {
        try {
            setIsLoading(true);
            const data = await socialAccountService.updateSocialAccount(platformId, updateData);
            setSocialAccounts(prev =>
                prev.map((acc: any) => acc.id === platformId ? data : acc)
            );
            return data;
        } catch (err) {
            console.error("Error updating social account:", err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const deleteSocialAccount = useCallback(async (platformId: number | string) => {
        try {
            setIsLoading(true);
            await socialAccountService.deleteSocialAccount(platformId);
            setSocialAccounts(prev =>
                prev.filter((acc: any) => acc.id !== platformId)
            );
        } catch (err) {
            console.error("Error deleting social account:", err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

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