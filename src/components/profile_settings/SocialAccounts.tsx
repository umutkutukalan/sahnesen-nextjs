import { useEffect } from "react";
import ProfileBorderImage from "../profile_settings_item/ProfileBorderImage";
import YourLinksAccount from "../profile_settings_item/YourLinksAccount";
import SocialAccountCard from "../profile_settings_item/SocialAccountCard";
import { useSocialAccount } from "@/hooks/social_accounts/useSocialAccounts";



const SocialAccounts = ({ user }) => {
  const { getSocialAccounts, socialAccounts, isLoading } = useSocialAccount();
  
  useEffect(() => {
    if (user?.id) {
      getSocialAccounts(user.id);
    }
  }, [user?.id, getSocialAccounts]);
  
  console.log("SocialAccounts component - user:", socialAccounts);
  
  return (
    <div className="min-h-screen">
      <ProfileBorderImage user={user} />
      <div className="mt-15 px-20 flex flex-col">
        <YourLinksAccount onUpdate={() => getSocialAccounts(user.id)} />
        <div className="flex flex-col gap-2 mt-5">
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            socialAccounts.map((account) => (
              <div key={account.id}>
                <SocialAccountCard
                  account={account}
                  onUpdate={() => getSocialAccounts(user.id)}
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
