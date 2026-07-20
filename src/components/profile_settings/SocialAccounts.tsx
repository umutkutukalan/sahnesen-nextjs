import { useEffect } from "react";
import ProfileBorderImage from "../profile_settings_item/ProfileBorderImage";
import YourLinksAccount from "../profile_settings_item/YourLinksAccount";
import SocialAccountCard from "../profile_settings_item/SocialAccountCard";
import { useSocialAccount } from "@/hooks/social_accounts/useSocialAccounts";

interface SocialAccountsProps {
  user: { username: string; [key: string]: unknown };
}

const SocialAccounts = ({ user }: SocialAccountsProps) => {
  const { getSocialAccounts, socialAccounts, isLoading } = useSocialAccount();

  useEffect(() => {
    if (user?.username) {
      getSocialAccounts();
    }
  }, [user?.username, getSocialAccounts]);

  return (
    <div className="min-h-screen">
      <ProfileBorderImage usernameSlug={user?.username} />
      <div className="mt-15 px-20 flex flex-col">
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
    </div>
  );
};

export default SocialAccounts;
