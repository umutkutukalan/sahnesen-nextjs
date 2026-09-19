"use client";

import Account from "@/components/profile_settings_item/Account";
import DeactivateAccount from "@/components/profile_settings_item/DeactivateAccount";
import DeleteAccount from "@/components/profile_settings_item/DeleteAccount";

export default function ProfileSettingsPage() {
  return (
    <div className="w-full flex flex-col">
      <Account />
      <DeactivateAccount />
      <DeleteAccount />
    </div>
  );
}
