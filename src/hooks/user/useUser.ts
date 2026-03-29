// hooks/user/useUser.ts
"use client";

import { userService, UpdateUserData } from "@/services/client/user/user.service";
import { useState, useCallback } from "react";

// --- Types ---
export interface UserFormData {
    name: string;
    surname: string;
    bio: string;
}

// --- Hook ---
export const useUser = () => {
    const [formData, setFormData] = useState<UserFormData>({
        name: "",
        surname: "",
        bio: "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const updateUser = useCallback(async (userData: UpdateUserData) => {
        try {
            setIsLoading(true);
            setError(null);
            const updatedUser = await userService.updateUser(userData);
            return updatedUser;
        } catch (err) {
            console.error("Kullanıcı güncellenirken hata oluştu:", err);
            setError(err as Error);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        formData,
        setFormData,
        updateUser,
        isLoading,
        error,
    };
};