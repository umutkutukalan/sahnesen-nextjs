"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import ProfileSettings from "@/pages/profile_settings/ProfileSettings";
import LoadingScreen from "@/components/LoadingScreen";

export default function SettingsPage() {
  const { user, loading } = useRequireAuth("/"); // Oturum yoksa direkt "/" (giriş/landing) ekranına atar

  if (loading || !user) {
    return <LoadingScreen />;
  }

  return <ProfileSettings />;
}
