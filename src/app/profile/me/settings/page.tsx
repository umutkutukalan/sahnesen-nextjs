"use client";

import SocialAccounts from "@/components/profile_settings/SocialAccounts";
import { useUser } from "@/context/UserContext"; // Path'i kendi klasör yapına göre düzenle

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SettingsPage() {
    const { user, loading } = useUser();
    const router = useRouter();

    // Eğer kullanıcı giriş yapmamışsa ve yükleme bittiyse login'e yönlendir
    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Yükleniyor...</p>
            </div>
        );
    }

    // Kullanıcı yoksa yönlendirme yapılana kadar boş döner
    if (!user) return null;

    return (
        <SocialAccounts user={user} />
    );
}