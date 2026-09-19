"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/UserContext";
import YourLinksAccount from "@/components/profile_settings_item/YourLinksAccount";
import SocialAccountCard from "@/components/profile_settings_item/SocialAccountCard";
import { useSocialAccount } from "@/hooks/social_accounts/useSocialAccounts";

export default function SocialSettingsPage() {
  const { user } = useAuth();
  const { getSocialAccounts, socialAccounts, isLoading } = useSocialAccount();

  useEffect(() => {
    if (user?.username) {
      getSocialAccounts();
    }
  }, [user?.username, getSocialAccounts]);

  return (
    <div className="w-full flex flex-col">
      <YourLinksAccount onUpdate={() => getSocialAccounts()} />
      <div className="flex flex-col gap-2 mt-5">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          socialAccounts.map((account) => (
            <div key={account.id}>
              <SocialAccountCard
                account={account}
                onUpdate={() => getSocialAccounts()}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
